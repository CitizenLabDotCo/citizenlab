import { IPhaseData } from 'api/phases/types';

interface TemplateData {
  participationMethod: 'ideation' | 'native_survey' | 'other';
  phaseId?: string;
}

export const getTemplateData = (phases: IPhaseData[]): TemplateData => {
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
};
