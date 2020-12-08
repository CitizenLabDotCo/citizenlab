import { IParticipationContextType } from 'typings';
import { isNilOrError } from 'utils/helperUtils';
import { getProjectInputTerm, IProjectData } from 'services/projects';
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

export type InputTerm = 'idea';

export function getInputTerm(
  participationContextType: IParticipationContextType,
  project: IProjectData | undefined | null | Error,
  phases: IPhaseData[] | undefined | null | Error
) {
  return {
    project: !isNilOrError(project) ? getProjectInputTerm(project) : null,
    phase:
      !isNilOrError(phases) && phases.length > 0
        ? getPhaseInputTerm(phases)
        : null,
  }[participationContextType];
}

export const ideaDefaultSortMethodFallback = 'trending';
