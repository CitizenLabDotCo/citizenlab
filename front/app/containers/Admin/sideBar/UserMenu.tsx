import React from 'react';

// components
import { Box, Icon, Text } from '@citizenlab/cl2-component-library';
import { Popup } from 'semantic-ui-react';
import NotificationsPopup from './NotificationsPopup';
import { NewNotificationsIndicator } from 'containers/MainHeader/NotificationMenu/components/NotificationCount';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

// style
import { colors } from 'utils/styleUtils';
import { ItemMenu, StyledBox } from './styles';

// hooks
import useAuthUser from 'hooks/useAuthUser';

// utils
import { isNilOrError } from 'utils/helperUtils';
import Avatar from 'components/Avatar';

// services
import signOut from 'api/authentication/sign_in_out/signOut';

export const UserMenu = () => {
  const { formatMessage } = useIntl();
  const authUser = useAuthUser();

  if (isNilOrError(authUser)) {
    return null;
  }

  const unreadNotificationsCount = authUser.attributes.unread_notifications;

  return (
    <Popup
      trigger={
        <StyledBox
          as="button"
          width="100%"
          display="flex"
          justifyContent="flex-start"
          mb="25px"
        >
          <Box display="flex" alignItems="center">
            <Avatar userId={authUser.id} size={30} addVerificationBadge />
            <Box display="flex" flex="1" flexDirection="column" opacity={0.7}>
              <Text
                color="white"
                my="0px"
                fontSize="base"
              >{`${authUser.attributes.first_name} ${authUser.attributes.last_name}`}</Text>
            </Box>
            <Box mr="20px">
              <Icon name="chevron-down" fill={colors.white} />
            </Box>
          </Box>
        </StyledBox>
      }
      on="click"
      position="right center"
      positionFixed
      offset={[0, -40]}
      basic
      wide
    >
      <Box width="224px">
        <ItemMenu buttonStyle="text">
          <Box display="flex" justifyContent="space-between" width="100%">
            <NotificationsPopup />
            {unreadNotificationsCount > 0 && (
              <NewNotificationsIndicator>
                {unreadNotificationsCount}
              </NewNotificationsIndicator>
            )}
          </Box>
        </ItemMenu>
        <ItemMenu buttonStyle="text">
          <Box display="flex" justifyContent="space-between" w="100%">
            {formatMessage({ ...messages.language })}
          </Box>
        </ItemMenu>
        <ItemMenu
          linkTo={formatMessage(messages.linkToCommunityPlatform)}
          buttonStyle="text"
          onClick={signOut}
        >
          <Box display="flex" justifyContent="space-between" w="100%">
            {formatMessage({ ...messages.signOut })}
            <Icon name="power" fill={colors.grey300} />
          </Box>
        </ItemMenu>
      </Box>
    </Popup>
  );
};
