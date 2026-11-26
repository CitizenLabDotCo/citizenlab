import React from 'react';

import useFileAttachments from 'api/file_attachments/useFileAttachments';
import { IPhaseData } from 'api/phases/types';

import { usePageSave } from 'components/admin/PageSaveContext';

import PhaseFieldsSkeleton from '../WorkspaceSkeleton/PhaseFieldsSkeleton';

import BuildPanel from './BuildPanel';

interface Props {
  projectId: string;
  phase: IPhaseData;
}

const PhaseSetup = ({ projectId, phase }: Props) => {
  const pageSave = usePageSave();
  const { data: fileAttachments } = useFileAttachments({
    attachable_id: phase.id,
    attachable_type: 'Phase',
  });

  if (!fileAttachments) return <PhaseFieldsSkeleton />;

  return (
    <BuildPanel
      // Discarding changes starts the fields over from the saved phase.
      key={`${phase.attributes.placement_type}-${pageSave?.revision}`}
      projectId={projectId}
      phase={phase}
      savedAttachments={fileAttachments.data}
    />
  );
};

export default PhaseSetup;
