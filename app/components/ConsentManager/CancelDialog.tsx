import React from 'react';
import Button from 'components/UI/Button';
import { ContentContainer, Spacer, ButtonContainer } from './PreferencesDialog';

import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

export default ({ onCancelBack, onCancelConfirm }) => {
  return (
    <ContentContainer role="dialog" aria-modal>
      <FormattedMessage {...messages.confirmation} tagName="h1" />
      <Spacer />
      <ButtonContainer>
        <Button onClick={onCancelBack} style="primary-inverse">
          <FormattedMessage {...messages.back} />
        </Button>
        <Button onClick={onCancelConfirm} style="primary">
          <FormattedMessage {...messages.confirm} />
        </Button>
      </ButtonContainer>
    </ContentContainer>
  );
};
