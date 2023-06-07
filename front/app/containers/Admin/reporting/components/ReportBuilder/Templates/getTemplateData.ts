import { IProjectData } from 'api/projects/types';
import { IPhaseData } from 'api/phases/types';

interface TemplateData {
  participationMethod: 'ideation' | 'native_survey' | 'other';
  phaseId?: string;
}

export const getTemplateData = (
  project: IProjectData,
  phases: IPhaseData[]
): TemplateData => {
  const hasPhases = project.attributes.process_type === 'timeline';

  if (hasPhases) {
    for (const phase of phases) {
      const participationMethod = phase.attributes.participation_method;

      if (
        participationMethod === 'ideation' ||
        participationMethod === 'native_survey'
      ) {
        return {
          participationMethod,
          phaseId: phase.id,
        };
      }
    }

    return {
      participationMethod: 'other',
      phaseId: undefined,
    };
  }

  const participationMethod = project.attributes.participation_method;

  if (
    participationMethod === 'ideation' ||
    participationMethod === 'native_survey'
  ) {
    return {
      participationMethod,
      phaseId: undefined,
    };
  }

  return {
    participationMethod: 'other',
    phaseId: undefined,
  };
};
