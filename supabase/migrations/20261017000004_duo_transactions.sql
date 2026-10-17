-- All competitive state writes go through one service-only transactional command.
-- Locking the match serializes join, scoring, advance and forfeit against each other.
revoke insert, update, delete on public.duo_matches from anon, authenticated;
revoke insert, update, delete on public.duo_participants from anon, authenticated;
revoke insert, update, delete on public.duo_answers from anon, authenticated;
grant update (last_seen_at) on public.duo_participants to authenticated;
drop policy if exists duo_matches_host_insert on public.duo_matches;
drop policy if exists duo_matches_participant_update on public.duo_matches;
drop policy if exists duo_participants_self_insert on public.duo_participants;
drop policy if exists duo_matches_participant_read on public.duo_matches;
create policy duo_matches_participant_read on public.duo_matches for select to authenticated
  using (auth.uid() = host_id or auth.uid() = guest_id);
create unique index if not exists duo_participants_one_role on public.duo_participants(match_id, role);

create or replace function public.duo_command(
  p_user uuid, p_action text, p_match uuid default null, p_room text default null,
  p_name text default 'Player', p_question integer default null, p_choice integer default null
) returns jsonb
language plpgsql security invoker set search_path = public, pg_temp
as $$
declare
  m public.duo_matches%rowtype;
  player public.duo_participants%rowtype;
  q public.content_questions%rowtype;
  previous public.duo_answers%rowtype;
  ids jsonb;
  code text;
  elapsed numeric;
  expired boolean;
  correct boolean;
  points integer;
  answer_count integer;
  winner uuid;
  tied boolean;
  scores integer[];
  users uuid[];
  result jsonb;
begin
  if p_user is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  if p_action = 'create' then
    select jsonb_agg(id) into ids from
      (select id from public.content_questions where published order by random() limit 8) pool;
    if ids is null then raise exception 'No questions available'; end if;
    loop
      code := upper(substr(md5(gen_random_uuid()::text), 1, 6));
      begin
        insert into public.duo_matches(room_code,host_id,question_ids)
          values(code,p_user,ids) returning * into m;
        exit;
      exception when unique_violation then null;
      end;
    end loop;
    insert into public.duo_participants(match_id,user_id,display_name,role)
      values(m.id,p_user,left(coalesce(nullif(trim(p_name),''),'Player'),60),'host');
    return jsonb_build_object('matchId',m.id,'roomCode',code,'questionCount',jsonb_array_length(ids));
  end if;

  if p_action = 'join' then
    select * into m from public.duo_matches where room_code = upper(trim(p_room)) for update;
  else
    select * into m from public.duo_matches where id = p_match for update;
  end if;
  if not found then raise exception 'Match not found' using errcode = 'P0002'; end if;

  if p_action = 'join' then
    if p_user = m.host_id or p_user = m.guest_id then
      update public.duo_participants set last_seen_at=clock_timestamp() where match_id=m.id and user_id=p_user;
      return jsonb_build_object('matchId',m.id,'roomCode',m.room_code,'rejoined',true);
    end if;
    if m.expires_at <= clock_timestamp() then raise exception 'Room expired'; end if;
    if m.status not in ('waiting','ready') or m.guest_id is not null then raise exception 'Room is full or already started'; end if;
    update public.duo_matches set guest_id=p_user where id=m.id;
    insert into public.duo_participants(match_id,user_id,display_name,role)
      values(m.id,p_user,left(coalesce(nullif(trim(p_name),''),'Player'),60),'guest');
    return jsonb_build_object('matchId',m.id,'roomCode',m.room_code,'rejoined',false);
  end if;

  if p_user <> m.host_id and p_user is distinct from m.guest_id then
    raise exception 'Not your match' using errcode = '42501';
  end if;
  select * into player from public.duo_participants where match_id=m.id and user_id=p_user;
  if not found then raise exception 'Participant missing' using errcode = '42501'; end if;

  if p_action = 'ready' then
    if m.status not in ('waiting','ready') then raise exception 'Match is not waiting'; end if;
    if m.expires_at <= clock_timestamp() then raise exception 'Room expired'; end if;
    update public.duo_participants set ready=true,last_seen_at=clock_timestamp() where match_id=m.id and user_id=p_user;
    select count(*) into answer_count from public.duo_participants where match_id=m.id and ready;
    if m.guest_id is not null and answer_count=2 then
      update public.duo_matches set status='active',current_index=0,started_at=clock_timestamp(),question_started_at=clock_timestamp() where id=m.id;
    end if;
    return jsonb_build_object('ready',true,'started',m.guest_id is not null and answer_count=2);
  end if;

  if p_action = 'abandon' then
    if m.status in ('finished','abandoned','expired') then return jsonb_build_object('status',m.status); end if;
    winner := case when p_user=m.host_id then m.guest_id else m.host_id end;
    if m.status='active' and winner is not null then
      update public.duo_matches set status='finished',winner_id=winner,is_tie=false,ended_at=clock_timestamp() where id=m.id;
      return jsonb_build_object('status','finished','winnerId',winner,'forfeited',true);
    end if;
    update public.duo_matches set status='abandoned',ended_at=clock_timestamp() where id=m.id;
    return jsonb_build_object('status','abandoned');
  end if;

  if p_action = 'answer' then
    -- Return the stored result after a lost response, even if the match has advanced.
    select * into previous from public.duo_answers where match_id=m.id and user_id=p_user and question_index=p_question;
    if found then
      select * into q from public.content_questions where id=previous.question_id;
      return jsonb_build_object('isCorrect',previous.is_correct,'correctIndex',q.answer_index,
        'explanation',q.explanation,'awardedPoints',previous.awarded_points,'timedOut',previous.chosen_index is null);
    end if;
    if m.status <> 'active' or p_question is distinct from m.current_index then raise exception 'Question is no longer active'; end if;
    select * into q from public.content_questions where id=m.question_ids->>m.current_index;
    if not found then raise exception 'Question not found'; end if;
    if p_choice is not null and (p_choice<0 or p_choice>=jsonb_array_length(q.options)) then raise exception 'Invalid answer'; end if;
    elapsed := greatest(0,extract(epoch from (clock_timestamp()-m.question_started_at))*1000);
    expired := elapsed>m.seconds_per_question*1000+1500;
    correct := not expired and p_choice is not null and p_choice=q.answer_index;
    points := case when correct then 100+round(50*greatest(0,1-elapsed/(m.seconds_per_question*1000)))::int+least(50,player.streak*10) else 0 end;
    insert into public.duo_answers(match_id,user_id,question_index,question_id,chosen_index,is_correct,answered_ms,awarded_points)
      values(m.id,p_user,p_question,q.id,case when expired then null else p_choice end,correct,least(elapsed,m.seconds_per_question*1000)::int,points);
    update public.duo_participants set score=score+points,correct_count=correct_count+case when correct then 1 else 0 end,
      streak=case when correct then streak+1 else 0 end,last_seen_at=clock_timestamp() where match_id=m.id and user_id=p_user;
    return jsonb_build_object('isCorrect',correct,'correctIndex',q.answer_index,'explanation',q.explanation,
      'awardedPoints',points,'timedOut',expired or p_choice is null);
  end if;

  if p_action = 'advance' then
    if m.status<>'active' or p_question is distinct from m.current_index then
      return jsonb_build_object('advanced',false,'status',m.status,'currentIndex',m.current_index);
    end if;
    expired := clock_timestamp()>m.question_started_at+make_interval(secs=>m.seconds_per_question)+interval '1500 milliseconds';
    if expired then
      -- Missing answers are recorded on the server, including for disconnected players.
      with missing as (
        insert into public.duo_answers(match_id,user_id,question_index,question_id,chosen_index,is_correct,answered_ms,awarded_points)
        select m.id,p.user_id,m.current_index,m.question_ids->>m.current_index,null,false,m.seconds_per_question*1000,0
        from public.duo_participants p where p.match_id=m.id
        on conflict (match_id,user_id,question_index) do nothing returning user_id
      ) update public.duo_participants set streak=0 where match_id=m.id and user_id in (select user_id from missing);
    end if;
    select count(*) into answer_count from public.duo_answers where match_id=m.id and question_index=m.current_index;
    if answer_count<2 then return jsonb_build_object('advanced',false,'waitingFor',2-answer_count); end if;
    if m.current_index+1>=jsonb_array_length(m.question_ids) then
      select array_agg(user_id order by user_id),array_agg(score order by user_id) into users,scores from public.duo_participants where match_id=m.id;
      tied := scores[1]=scores[2];
      winner := case when tied then null when scores[1]>scores[2] then users[1] else users[2] end;
      update public.duo_matches set status='finished',winner_id=winner,is_tie=tied,ended_at=clock_timestamp() where id=m.id;
      return jsonb_build_object('advanced',true,'finished',true,'winnerId',winner,'isTie',tied);
    end if;
    update public.duo_matches set current_index=current_index+1,question_started_at=clock_timestamp() where id=m.id;
    return jsonb_build_object('advanced',true,'currentIndex',m.current_index+1);
  end if;
  raise exception 'Unknown command';
end;
$$;
revoke all on function public.duo_command(uuid,text,uuid,text,text,integer,integer) from public, anon, authenticated;
grant execute on function public.duo_command(uuid,text,uuid,text,text,integer,integer) to service_role;
