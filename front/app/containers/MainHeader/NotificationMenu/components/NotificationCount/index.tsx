import React from 'react';
import { isNumber } from 'lodash-es';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';
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

const NewNotificationsIndicator = styled.div`
  color: #fff;
  font-size: ${fontSizes.xs}px;
  line-height: ${fontSizes.xs}px;
  background: ${({ theme }) =>
    theme.invertedNavbarColors && theme.navbarTextColor
      ? theme.colors.tenantText
      : colors.error};
  padding: 4px;
  border-radius: ${(props) => props.theme.borderRadius};
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
  display: flex;
  justify-content: center;
  align-items: center;
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
}: Props & WrappedComponentProps) => {
  const theme = useTheme();

  return (
    <Container>
      <IconButton
        onClick={onToggleDropdown}
        iconName="notification"
        a11y_buttonActionMessage={formatMessage(
          messages.a11y_notificationsLabel,
          { count }
        )}
        iconColor={theme.navbarTextColor || colors.textSecondary}
        iconColorOnHover={
          theme.navbarTextColor
            ? darken(0.2, theme.navbarTextColor)
            : colors.textPrimary
        }
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
