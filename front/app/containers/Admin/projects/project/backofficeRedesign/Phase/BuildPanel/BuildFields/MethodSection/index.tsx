import React from 'react';

import { InputTerm, ParticipationMethod } from 'api/phases/types';

import CausesSection from './CausesSection';
import CommonGroundSection from './CommonGroundSection';
import DemographicsCard from './DemographicsCard';
import FormSection from './FormSection';
import InformationSection from './InformationSection';
import VotingOptionsSection from './VotingOptionsSection';

interface Props {
  projectId: string;
  participationMethod: ParticipationMethod;
  phaseId?: string;
  inputTerm?: InputTerm;
  formInSurveyOptions: boolean;
}

const MethodSection = ({
  projectId,
  participationMethod,
  phaseId,
  inputTerm,
  formInSurveyOptions,
}: Props) => {
  switch (participationMethod) {
    case 'poll':
      // Poll questions are edited from the Quick poll option.
      return null;
    case 'common_ground':
      return phaseId ? (
        <CommonGroundSection projectId={projectId} phaseId={phaseId} />
      ) : null;
    case 'voting':
      return phaseId ? (
        <>
          <VotingOptionsSection projectId={projectId} phaseId={phaseId} />
          <DemographicsCard phaseId={phaseId} />
        </>
      ) : null;
    case 'volunteering':
      return phaseId ? <CausesSection phaseId={phaseId} /> : null;
    case 'information':
      return phaseId ? (
        <InformationSection projectId={projectId} phaseId={phaseId} />
      ) : null;
    default:
      return (
        <FormSection
          projectId={projectId}
          participationMethod={participationMethod}
          phaseId={phaseId}
          inputTerm={inputTerm}
          formInSurveyOptions={formInSurveyOptions}
        />
      );
  }
};

export default MethodSection;
