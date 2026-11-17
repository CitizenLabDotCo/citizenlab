import React, { MouseEvent, KeyboardEvent } from 'react';

import { colors, IconButton } from '@citizenlab/cl2-component-library';
import { focusRingBorder } from 'global-styles';
import { WrappedComponentProps, MessageDescriptor } from 'react-intl';
import { css } from 'styled-components';

import { injectIntl } from 'utils/cl-intl';

import messages from './messages';

export const closeIconButtonStyle = css`
  border-radius: 8px;
  border: solid 1px transparent;
  transition: all 100ms ease-out;
  outline: none !important;
  padding: 0px;

  &:hover {
    background: rgba(15, 20, 35, 0.05);
  }

  /* This button forces outline:none, so the global outline ring can't apply —
     use the shared border-based ring instead. */
  &.focus-visible {
    ${focusRingBorder}
  }
`;

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
