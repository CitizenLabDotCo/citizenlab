import React from 'react';

import { InputTerm, ParticipationMethod } from 'api/phases/types';

import CausesSection from './CausesSection';
import CommonGroundSection from './CommonGroundSection';
import FormSection from './FormSection';
import InformationSection from './InformationSection';
import PollSection from './PollSection';

interface Props {
  projectId: string;
  participationMethod: ParticipationMethod;
  phaseId?: string;
  inputTerm?: InputTerm;
}

const MethodSection = ({
  projectId,
  participationMethod,
  phaseId,
  inputTerm,
}: Props) => {
  switch (participationMethod) {
    case 'poll':
      return phaseId ? <PollSection phaseId={phaseId} /> : null;
    case 'common_ground':
      return phaseId ? (
        <CommonGroundSection projectId={projectId} phaseId={phaseId} />
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
        />
      );
  }
};

export default MethodSection;
