import React from 'react';

// components
import Button from 'components/UI/Button';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

interface Props {
  disabled: boolean;
  processing: boolean;
  onClick: () => void;
}

const SaveButton = (props: Props) => (
  <Button
    {...props}
    id="e2e-content-builder-topbar-save"
    buttonStyle="primary"
    data-testid="contentBuilderTopBarSaveButton"
  >
    <FormattedMessage {...messages.contentBuilderSave} />
  </Button>
);

export default SaveButton;
