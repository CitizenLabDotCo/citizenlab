import React, { MouseEvent, KeyboardEvent} from 'react';
import { IconButton } from '@citizenlab/cl2-component-library';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

interface Props {
  onClick: () => void;
  a11y_buttonActionDescription: ReactIntl.FormattedMessage.MessageDescriptor;
  a11y_buttonActionMessage: ReactIntl.FormattedMessage.MessageDescriptor;
  iconColor: string;
  iconColorOnHover: string;
  className?: string;
  widthInPx?: number;
  heightInPx?: number;
}

const CloseIconButton = ({
  onClick,
  a11y_buttonActionMessage,
  intl: { formatMessage },
  iconColor,
  iconColorOnHover,
  className,
  widthInPx,
  heightInPx,
}: Props & InjectedIntlProps) => {
  return (
    <IconButton
      className={className ?? ''}
      iconName="close"
      onClick={onClick}
      a11y_buttonActionDescription={formatMessage(a11y_buttonActionMessage)}
      iconColor={iconColor}
      iconColorOnHover={iconColorOnHover}
      widthInPx={widthInPx}
      heightInPx={heightInPx}
    />
  );
};

export default injectIntl(CloseIconButton);
