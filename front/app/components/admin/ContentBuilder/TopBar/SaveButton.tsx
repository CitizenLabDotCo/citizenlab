import React from 'react';

// components
import Button, { Props as ButtonProps } from 'components/UI/Button';

// styling
import { colors } from 'utils/styleUtils';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

interface Props {
  disabled: boolean;
  processing: boolean;
  bgColor?: string;
  icon?: ButtonProps['icon'];
  onClick: () => void;
}

const SaveButton = ({ bgColor = colors.primary, icon, ...props }: Props) => (
  <Button
    {...props}
    id="e2e-content-builder-topbar-save"
    buttonStyle="primary"
    bgColor={bgColor}
    icon={icon}
    data-testid="contentBuilderTopBarSaveButton"
  >
    <FormattedMessage {...messages.contentBuilderSave} />
  </Button>
);

export default SaveButton;
