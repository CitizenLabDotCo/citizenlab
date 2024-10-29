import React from 'react';

import { IconButton, colors } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  onClick: () => void;
}

const GoBackButton = ({ onClick }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <IconButton
      data-testid="goBackButton"
      id="e2e-go-back-button"
      iconName="arrow-left"
      buttonType="button"
      iconColor={colors.textSecondary}
      iconColorOnHover={colors.primary}
      iconWidth="20px"
      a11y_buttonActionMessage={formatMessage(messages.goBackButtonMessage)}
      ml="8px"
      onClick={onClick}
    />
  );
};

export default GoBackButton;
