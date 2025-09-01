import React from 'react';

import { IconButton } from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';

import { useIntl } from 'utils/cl-intl';

import messages from '../../../messages';

interface Props {
  onClick: () => void;
}

const ShowFullMenuButton = ({ onClick }: Props) => {
  const theme = useTheme();
  const { formatMessage } = useIntl();

  return (
    <IconButton
      onClick={onClick}
      iconName="menu"
      a11y_buttonActionMessage={formatMessage(messages.showFullMenu)}
      iconColor={theme.navbarTextColor ?? theme.colors.tenantText}
      iconColorOnHover={theme.navbarTextColor ?? theme.colors.tenantText}
    />
  );
};

export default ShowFullMenuButton;
