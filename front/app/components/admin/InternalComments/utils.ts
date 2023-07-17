import { MentionRoles } from 'api/mentions/types';

export function getMentionRoles(isIdea: boolean): MentionRoles[] {
  return isIdea ? ['admin', 'moderator'] : ['admin'];
}
