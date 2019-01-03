import React from 'react';
import Button from 'components/UI/Button';
import { ContentContainer } from './PreferencesDialog';
import { ButtonContainer } from './Container';

import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

const CancelDialog = ({ onCancelBack, onCancelConfirm }) => (
  <ContentContainer role="dialog" aria-modal>
    <FormattedMessage {...messages.confirmation} tagName="h1" />
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

export default CancelDialog;
