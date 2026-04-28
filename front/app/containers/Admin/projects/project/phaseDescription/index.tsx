import React from 'react';

import { useParams } from 'utils/router';

import usePhase from 'api/phases/usePhase';

import useFeatureFlag from 'hooks/useFeatureFlag';

import DraftPhaseDescription from './DraftPhaseDescription';
import SimplePhaseDescription from './SimplePhaseDescription';

const AdminPhaseDescription = () => {
  const { phaseId } = useParams({ strict: false }) as { phaseId: string };
  const { data: phase } = usePhase(phaseId);
  const draftPhaseDescriptionEnabled = useFeatureFlag({
    name: 'draft_phase_description',
  });

  if (!phase) return null;

  const { description_multiloc, draft_description_multiloc } =
    phase.data.attributes;

  if (draftPhaseDescriptionEnabled) {
    return (
      <DraftPhaseDescription
        phaseId={phaseId}
        descriptionMultiloc={description_multiloc}
        draftDescriptionMultiloc={draft_description_multiloc}
      />
    );
  }

  return (
    <SimplePhaseDescription
      phaseId={phaseId}
      descriptionMultiloc={description_multiloc}
    />
  );
};

export default AdminPhaseDescription;
