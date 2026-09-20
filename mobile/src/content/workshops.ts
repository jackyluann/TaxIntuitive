import type { Workshop } from './types';

/**
 * Workshops.
 *
 * The website's Workshops page currently has a "Book Now" call to action but no published
 * sessions, so this list is intentionally EMPTY: the Workshops screen renders its
 * "Coming soon — request a workshop" state instead of inventing events.
 *
 * To publish one, add an entry here (or a row in Supabase `content_workshops`).
 */
export const workshops: Workshop[] = [];

/** Where workshop requests and general contact go. */
export const contact = {
  email: 'jackyluan777@gmail.com',
  location: 'Vancouver, BC',
  siteUrl: 'https://www.taxintuitive.com',
};
