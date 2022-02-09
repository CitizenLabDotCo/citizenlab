import React from 'react';
import { IconButton } from '@citizenlab/cl2-component-library';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

interface Props {
  onClick: () => void;
  a11y_buttonActionDescription: ReactIntl.FormattedMessage.MessageDescriptor;
  iconColor: string;
  iconColorOnHover: string;
  className?: string;
}

const CloseIconButton = ({
  onClick,
  a11y_buttonActionDescription,
  intl: { formatMessage },
  iconColor,
  iconColorOnHover,
  className,
}: Props & InjectedIntlProps) => {
  return (
    <IconButton
      className={className ?? ''}
      iconName="close"
      onClick={onClick}
      a11y_buttonActionDescription={formatMessage(a11y_buttonActionDescription)}
      iconColor={iconColor}
      iconColorOnHover={iconColorOnHover}
    />
  );
};

export default injectIntl(CloseIconButton);
