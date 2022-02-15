import React from 'react';
import { isNumber } from 'lodash-es';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../messages';

// components
import { IconButton } from '@citizenlab/cl2-component-library';

// style
import styled, { useTheme } from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';
import { darken } from 'polished';

const Container = styled.div`
  position: relative;
`;

const NotificationIconButton = styled(IconButton)``;

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
  onToggleDropdown: () => void;
  dropdownOpened: boolean;
};

const NotificationCount = ({
  count,
  dropdownOpened,
  onToggleDropdown,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const theme: any = useTheme();

  return (
    <Container>
      <NotificationIconButton
        onClick={onToggleDropdown}
        iconName="notification"
        a11y_buttonActionMessage={formatMessage(
          messages.a11y_notificationsLabel,
          { count }
        )}
        iconColor={theme.navbarTextColor || colors.label}
        iconColorOnHover={
          theme.navbarTextColor
            ? darken(0.2, theme.navbarTextColor)
            : colors.text
        }
        iconWidthInPx={18}
        heightInPx={24}
        ariaExpanded={dropdownOpened}
        ariaControls="notifications-dropdown"
      />
      {isNumber(count) && count > 0 ? (
        <NewNotificationsIndicator>{count}</NewNotificationsIndicator>
      ) : null}
    </Container>
  );
};

export default injectIntl(NotificationCount);
