import React, { useState } from 'react';

import { IIdeaData } from 'api/ideas/types';
import useUpdateIdea from 'api/ideas/useUpdateIdea';
import useIdeasPhases from 'api/ideas_phases/useIdeasPhases';
import { IPhaseData } from 'api/phases/types';

import PhaseDeselectModal from 'components/admin/PostManager/components/PostTable/Row/PhaseDeselectModal';
import PhasesSelector from 'components/admin/PostManager/components/PostTable/Row/selectors/PhasesSelector';
import {
  getRemovedPhase,
  ideaHasVotesInPhase,
} from 'components/admin/PostManager/components/PostTable/Row/utils';

interface Props {
  idea: IIdeaData;
  phases: IPhaseData[];
}

const DrawerPhases = ({ idea, phases }: Props) => {
  const { mutate: updateIdea, isPending } = useUpdateIdea();
  const ideasPhases = useIdeasPhases(
    idea.relationships.ideas_phases.data.map((relation) => relation.id)
  );
  const [pendingPhaseIds, setPendingPhaseIds] = useState<string[] | null>(null);
  const currentPhaseIds = idea.relationships.phases.data.map(
    (phase) => phase.id
  );

  const savePhases = (phaseIds: string[]) =>
    updateIdea({ id: idea.id, requestBody: { phase_ids: phaseIds } });

  // Taking an idea out of a phase deletes its votes there, so ask first.
  const handleUpdatePhases = (phaseIds: string[]) => {
    const removed = getRemovedPhase(phaseIds, currentPhaseIds);

    if (removed && ideaHasVotesInPhase(removed, ideasPhases)) {
      setPendingPhaseIds(phaseIds);
    } else {
      savePhases(phaseIds);
    }
  };

  return (
    <>
      <PhasesSelector
        selectedPhases={currentPhaseIds}
        phases={phases}
        onUpdatePhases={handleUpdatePhases}
      />
      <PhaseDeselectModal
        open={!!pendingPhaseIds}
        isLoading={isPending}
        onClose={() => setPendingPhaseIds(null)}
        onConfirm={() => {
          if (pendingPhaseIds) savePhases(pendingPhaseIds);
          setPendingPhaseIds(null);
        }}
      />
    </>
  );
};

export default DrawerPhases;
