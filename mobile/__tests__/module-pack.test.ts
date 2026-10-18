import { moduleLessons, moduleQuestions, moduleQuizzes } from '@/content/module-pack';
import { bundledContent } from '@/content';

describe('October curriculum coverage', () => {
  it('includes every supplied module, lesson card, scenario and quiz', () => {
    expect(moduleLessons).toHaveLength(7);
    expect(moduleQuestions).toHaveLength(45);
    expect(moduleQuizzes).toHaveLength(8);
    for (const lesson of moduleLessons) {
      expect(lesson.body.filter(b => b.type === 'heading')).toHaveLength(4);
      expect(lesson.body.filter(b => b.type === 'example')).toHaveLength(1);
      for (const block of lesson.body) {
        if ('text' in block) expect(block.text.trim().length).toBeGreaterThan(0);
      }
      const quiz = moduleQuizzes.find(q => q.id === lesson.relatedQuizId)!;
      expect(quiz.questionIds).toHaveLength(5);
      for (const id of quiz.questionIds!) {
        const question = moduleQuestions.find(q => q.id === id)!;
        expect(question.teachesLessonId).toBe(lesson.id);
        expect(['easy', 'medium', 'hard']).toContain(question.difficulty);
      }
    }
    expect(moduleQuizzes.find(q => q.id === 'quiz-myth-busters')?.questionIds).toHaveLength(10);
  });
  it('keeps all explicit quiz IDs resolvable and unique', () => {
    const ids = new Set(bundledContent.questions.map(q => q.id));
    for (const quiz of bundledContent.quizzes) {
      if (!quiz.questionIds) continue;
      expect(new Set(quiz.questionIds).size).toBe(quiz.questionIds.length);
      for (const id of quiz.questionIds) expect(ids.has(id)).toBe(true);
    }
  });
  it('preserves supplied answers after adapting open questions', () => {
    const answer = (id: string) => { const q = moduleQuestions.find(q => q.id === id)!; return q.options[q.answerIndex]; };
    expect(answer('q-module-5-1')).toBe('$331');
    expect(answer('q-module-6-3')).toBe('$16,452');
    expect(answer('q-module-7-2')).toBe('$3,000');
    expect(answer('q-module-9-1')).toBe('First Home Savings Account');
    expect(answer('q-module-10-5')).toBe('$2,000 of growth and grants');
    expect(answer('q-module-11-3')).toBe('$40');
  });
});
