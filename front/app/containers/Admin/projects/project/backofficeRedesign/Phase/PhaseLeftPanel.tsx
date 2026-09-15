import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useFileAttachments from 'api/file_attachments/useFileAttachments';
import { IPhaseData } from 'api/phases/types';

import BackToProjectSetup from './BackToProjectSetup';
import BuildPanel from './BuildPanel';

interface Props {
  projectId: string;
  phase: IPhaseData;
}

const PhaseLeftPanel = ({ projectId, phase }: Props) => {
  const { data: fileAttachments } = useFileAttachments({
    attachable_id: phase.id,
    attachable_type: 'Phase',
  });

  return (
    <Box display="flex" flexDirection="column" minHeight="100%">
      <BackToProjectSetup projectId={projectId} />

      {fileAttachments && (
        <BuildPanel
          projectId={projectId}
          phase={phase}
          savedAttachments={fileAttachments.data}
        />
      )}
    </Box>
  );
};

export default PhaseLeftPanel;
