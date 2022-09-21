import React, { MouseEvent, KeyboardEvent } from 'react';
import { colors, IconButton } from '@citizenlab/cl2-component-library';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';
import { MessageDescriptor } from 'react-intl';

interface Props {
  onClick: (event?: MouseEvent | KeyboardEvent) => void;
  a11y_buttonActionMessage?: MessageDescriptor;
  iconColor?: string;
  iconColorOnHover?: string;
  className?: string;
  iconWidth?: string;
  iconHeight?: string;
}

const CloseIconButton = ({
  onClick,
  a11y_buttonActionMessage,
  intl: { formatMessage },
  iconColor = colors.label,
  iconColorOnHover = '#000',
  className,
  iconWidth = '15px',
  iconHeight = '15px',
}: Props & InjectedIntlProps) => {
  return (
    <IconButton
      className={className ?? ''}
      iconName="close"
      onClick={onClick}
      a11y_buttonActionMessage={formatMessage(
        a11y_buttonActionMessage
          ? a11y_buttonActionMessage
          : messages.a11y_buttonActionMessage
      )}
      iconColor={iconColor}
      iconColorOnHover={iconColorOnHover}
      iconWidth={iconWidth}
      iconHeight={iconHeight}
    />
  );
};

export default injectIntl(CloseIconButton);
