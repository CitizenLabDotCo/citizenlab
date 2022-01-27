import React from 'react';
import { isNumber } from 'lodash-es';
import { removeFocusAfterMouseClick } from 'utils/helperUtils';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../messages';

// components
import { Icon } from '@citizenlab/cl2-component-library';

// style
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';
import { darken } from 'polished';
import { ScreenReaderOnly } from 'utils/a11y';

const Container = styled.button`
  width: 24px;
  height: 24px;
  align-items: center;
  cursor: pointer;
  display: flex;
  fill: ${({ theme }) => theme.navbarTextColor || colors.label};
  justify-content: center;
  padding: 0;
  position: relative;

  &:hover,
  &:focus {
    fill: ${({ theme }) =>
      theme.navbarTextColor ? darken(0.2, theme.navbarTextColor) : colors.text};
  }
`;

const NotificationIcon = styled(Icon)`
  height: 24px;
  fill: inherit;
  transition: all 100ms ease-out;
`;

const NewNotificationsIndicator = styled.div`
  color: #fff;
  font-size: ${fontSizes.xs}px;
  line-height: ${fontSizes.xs}px;
  background: ${({ theme }) =>
    theme.invertedNavbarColors && theme.navbarTextColor
      ? theme.colorText
      : colors.clRed};
  padding: 4px;
  border-radius: ${(props: any) => props.theme.borderRadius};
  border: solid 1px
    ${({ theme }) =>
      theme.invertedNavbarColors && theme.navbarBackgroundColor
        ? theme.navbarBackgroundColor
        : '#fff'};
  position: absolute;
  top: -9px;
  left: 15px;
  min-width: 18px;
  min-height: 18px;
`;

type Props = {
  count?: number;
  onClick?: (event: React.FormEvent<any>) => void;
  dropdownOpened: boolean;
};

const NotificationCount = ({
  count,
  dropdownOpened,
  onClick,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  return (
    <Container
      onMouseDown={removeFocusAfterMouseClick}
      onClick={onClick}
      aria-expanded={dropdownOpened}
    >
      <NotificationIcon name="notification" />
      <ScreenReaderOnly>
        {formatMessage(messages.notificationsLabel)}
      </ScreenReaderOnly>
      {isNumber(count) && count > 0 ? (
        <NewNotificationsIndicator>{count}</NewNotificationsIndicator>
      ) : null}
    </Container>
  );
};

export default injectIntl(NotificationCount);
