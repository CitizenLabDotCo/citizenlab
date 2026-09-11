import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useFileAttachments from 'api/file_attachments/useFileAttachments';
import { IPhaseData } from 'api/phases/types';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

import BuildPanel from './BuildPanel';

interface Props {
  projectId: string;
  phase: IPhaseData;
}

const PhaseLeftPanel = ({ projectId, phase }: Props) => {
  const { formatMessage } = useIntl();
  const { data: fileAttachments } = useFileAttachments({
    attachable_id: phase.id,
    attachable_type: 'Phase',
  });

  return (
    <Box display="flex" flexDirection="column" minHeight="100%">
      <Box pt="16px" px="16px">
        <ButtonWithLink
          to="/admin/projects/$projectId"
          params={{ projectId }}
          buttonStyle="text"
          icon="chevron-left"
          size="s"
          padding="4px 8px"
          justify="left"
        >
          {formatMessage(messages.backToProjectSetup)}
        </ButtonWithLink>
      </Box>

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
