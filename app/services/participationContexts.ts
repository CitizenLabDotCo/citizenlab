export type SurveyServices =
  | 'typeform'
  | 'survey_monkey'
  | 'google_forms'
  | 'enalyzer';

export type ParticipationMethod =
  | 'ideation'
  | 'information'
  | 'survey'
  | 'budgeting'
  | 'poll'
  | 'volunteering';

export type IdeaDefaultSortMethod =
  | 'trending'
  | 'random'
  | 'popular'
  | 'new'
  | '-new'
  | null;

export type InputTerm = 'idea';

export const ideaDefaultSortMethodFallback = 'trending';
