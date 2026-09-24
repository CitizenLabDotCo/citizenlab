import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import NewBOLinkButton from 'components/UI/NewBOLinkButton';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

interface Props {
  projectId: string;
}

const BackToProjectSetup = ({ projectId }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Box pt="16px" px="16px">
      <NewBOLinkButton
        to="/admin/projects/$projectId"
        params={{ projectId }}
        buttonStyle="text"
        icon="chevron-left"
        padding="0 8px"
        justify="left"
      >
        {formatMessage(messages.backToProjectSetup)}
      </NewBOLinkButton>
    </Box>
  );
};

export default BackToProjectSetup;
