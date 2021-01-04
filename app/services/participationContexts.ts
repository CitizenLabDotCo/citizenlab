import { isNilOrError } from 'utils/helperUtils';
import {
  getProjectInputTerm,
  IProjectData,
  ProcessType,
} from 'services/projects';
import { getPhaseInputTerm, IPhaseData } from 'services/phases';

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

export const INPUT_TERMS = [
  'idea',
  'option',
  'project',
  'question',
  'issue',
  'contribution',
];
export type InputTerm =
  | 'idea'
  | 'option'
  | 'project'
  | 'question'
  | 'issue'
  | 'contribution';

export function getInputTerm(
  processType: ProcessType,
  project: IProjectData | undefined | null | Error,
  phases: IPhaseData[] | undefined | null | Error
) {
  return {
    // To make sure copy depending on an input_term doesn't break,
    // we have a fallback to idea here.
    continuous: !isNilOrError(project) ? getProjectInputTerm(project) : 'idea',
    // (2020/12/9): When a new timeline project is created, phases will initially
    // be []. To make sure we don't break copy that depends on an input_term,
    // we have the fallback to idea here in that case.
    timeline:
      !isNilOrError(phases) && phases.length > 0
        ? getPhaseInputTerm(phases)
        : 'idea',
  }[processType];
}

export const ideaDefaultSortMethodFallback = 'trending';
