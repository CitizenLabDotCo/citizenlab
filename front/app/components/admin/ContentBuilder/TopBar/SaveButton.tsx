import React from 'react';

import { colors } from '@citizenlab/cl2-component-library';

import Button, { Props as ButtonProps } from 'components/UI/Button';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

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
