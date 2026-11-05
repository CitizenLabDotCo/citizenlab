import React from 'react';

import { Button } from '@citizenlab/cl2-component-library';

import { FormattedMessage } from 'utils/cl-intl';

import BaseFooter from '../BaseFooter';
import messages from '../messages';

interface Props {
  onAccept: () => void;
  openPreferencesScreen: () => void;
  onClose: () => void;
}

const Footer = ({ onAccept, openPreferencesScreen, onClose }: Props) => {
  return (
    <BaseFooter>
      <Button
        px="4px"
        buttonStyle="text"
        onClick={openPreferencesScreen}
        // Do not remove id, it is used for custom even tracking in GTM
        id="manage-preferences-btn"
        data-testid="manage-preferences-btn"
        data-cy="e2e-manage-preferences-btn"
      >
        <FormattedMessage {...messages.manage} />
      </Button>
      <Button
        buttonStyle="primary"
        onClick={onClose}
        // Do not remove id, it is used for custom even tracking in GTM
        id="reject-cookies-btn"
        data-testid="reject-cookies-btn"
      >
        <FormattedMessage {...messages.reject} />
      </Button>
      <Button
        buttonStyle="primary"
        onClick={onAccept}
        // Do not remove id, it is used for custom even tracking in GTM
        id="accept-cookies-btn"
        data-testid="accept-cookies-btn"
        data-cy="e2e-accept-cookies-btn"
      >
        <FormattedMessage {...messages.accept} />
      </Button>
    </BaseFooter>
  );
};

export default Footer;
