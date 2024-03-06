import React from 'react';

// components
import Button, { Props as ButtonProps } from 'components/UI/Button';

// styling
import { colors } from '@citizenlab/cl2-component-library';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

const SaveButton = ({ bgColor = colors.primary, ...props }: ButtonProps) => (
  <Button
    {...props}
    id="e2e-content-builder-topbar-save"
    buttonStyle="primary"
    bgColor={bgColor}
    data-testid="contentBuilderTopBarSaveButton"
  >
    <FormattedMessage {...messages.contentBuilderSave} />
  </Button>
);

export default SaveButton;
