import React from 'react';

import { useParams } from 'react-router-dom';

import usePhase from 'api/phases/usePhase';

import DraftPhaseDescription from '../phaseSetup/components/DraftPhaseDescription';

const AdminPhaseDescription = () => {
  const { phaseId } = useParams() as { phaseId: string };
  const { data: phase } = usePhase(phaseId);

  if (!phase) return null;

  const { description_multiloc, draft_description_multiloc } =
    phase.data.attributes;

  return (
    <DraftPhaseDescription
      phaseId={phaseId}
      descriptionMultiloc={description_multiloc}
      draftDescriptionMultiloc={draft_description_multiloc}
    />
  );
};

export default AdminPhaseDescription;
