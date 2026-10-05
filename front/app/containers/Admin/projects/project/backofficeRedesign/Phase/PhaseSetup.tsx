import React from 'react';

import useFileAttachments from 'api/file_attachments/useFileAttachments';
import { IPhaseData } from 'api/phases/types';

import { usePhaseSave } from '../_shared/PhaseSaveContext';

import BuildPanel from './BuildPanel';

interface Props {
  projectId: string;
  phase: IPhaseData;
}

const PhaseSetup = ({ projectId, phase }: Props) => {
  const phaseSave = usePhaseSave();
  const { data: fileAttachments } = useFileAttachments({
    attachable_id: phase.id,
    attachable_type: 'Phase',
  });

  if (!fileAttachments) return null;

  return (
    <BuildPanel
      // Discarding changes starts the fields over from the saved phase.
      key={phaseSave?.revision}
      projectId={projectId}
      phase={phase}
      savedAttachments={fileAttachments.data}
    />
  );
};

export default PhaseSetup;
