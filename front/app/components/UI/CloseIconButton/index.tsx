import React, { MouseEvent, KeyboardEvent } from 'react';
import { colors, IconButton } from '@citizenlab/cl2-component-library';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps, MessageDescriptor } from 'react-intl';
import messages from './messages';

interface Props {
  onClick: (event?: MouseEvent | KeyboardEvent) => void;
  a11y_buttonActionMessage?: MessageDescriptor;
  iconColor?: string;
  iconColorOnHover?: string;
  className?: string;
  iconWidth?: string;
  iconHeight?: string;
  fullScreen?: boolean;
}

const CloseIconButton = ({
  onClick,
  a11y_buttonActionMessage,
  intl: { formatMessage },
  iconColor = colors.textSecondary,
  iconColorOnHover = '#000',
  className,
  iconWidth = '24px',
  iconHeight = '24px',
  fullScreen = false,
}: Props & WrappedComponentProps) => {
  return (
    <IconButton
      className={className ?? ''}
      iconName={fullScreen ? 'arrow-left' : 'close'}
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
