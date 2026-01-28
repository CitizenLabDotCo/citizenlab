import { ParticipationMethod } from 'api/phases/types';

/**
 * Check if a method is idea-based (ideation or proposals).
 */
export function isIdeaBasedMethod(method?: ParticipationMethod): boolean {
  return method === 'ideation' || method === 'proposals';
}
