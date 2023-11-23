import React from 'react';

// components
import { IconButton } from '@citizenlab/cl2-component-library';

// style
import { useTheme } from 'styled-components';

// intl
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
      iconColor={theme.colors.tenantText}
      iconColorOnHover={theme.colors.tenantText}
    />
  );
};

export default ShowFullMenuButton;
