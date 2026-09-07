import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

interface Props {
  projectId: string;
}

const PhaseLeftPanel = ({ projectId }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Box p="12px" display="flex" flexDirection="column" gap="16px">
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
  );
};

export default PhaseLeftPanel;
