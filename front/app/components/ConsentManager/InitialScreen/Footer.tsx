import React from 'react';

import { Box, Button } from '@citizenlab/cl2-component-library';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';

interface Props {
  onAccept: () => void;
  openPreferencesScreen: () => void;
  onClose: () => void;
}

const Footer = ({ onAccept, openPreferencesScreen, onClose }: Props) => {
  return (
    <Box
      width="100%"
      display="flex"
      alignItems="center"
      justifyContent="flex-end"
      gap="8px"
    >
      <Button
        className="integration-open-modal"
        px="4px"
        buttonStyle="text"
        onClick={openPreferencesScreen}
        data-testid="e2e-manage-preferences-btn"
      >
        <FormattedMessage {...messages.manage} />
      </Button>
      <Button buttonStyle="primary" onClick={onClose}>
        <FormattedMessage {...messages.reject} />
      </Button>
      <Button
        className="e2e-accept-cookies-btn"
        buttonStyle="primary"
        onClick={onAccept}
        autoFocus
      >
        <FormattedMessage {...messages.accept} />
      </Button>
    </Box>
  );
};

export default Footer;
