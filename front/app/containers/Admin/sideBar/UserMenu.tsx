import React, { useState, useRef } from 'react';

// components
import { Box, Icon, Text } from '@citizenlab/cl2-component-library';
import { Popup } from 'semantic-ui-react';
import LanguageSelectorPopup from './LanguageSelectorPopup';

// i18n
import { MessageDescriptor, useIntl } from 'utils/cl-intl';
import messages from './messages';

// style
import { colors } from 'utils/styleUtils';
import { ItemMenu, StyledBox, StyleIconBox } from './styles';

// hooks
import useAuthUser from 'hooks/useAuthUser';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useLocale from 'hooks/useLocale';

// utils
import { isNilOrError } from 'utils/helperUtils';
import Avatar from 'components/Avatar';

// services
import signOut from 'api/authentication/sign_in_out/signOut';
import { IUserData } from 'api/users/types';

export const UserMenu = () => {
  const { formatMessage } = useIntl();
  const { data: appConfig } = useAppConfiguration();
  const locale = useLocale();
  const tenantLocales = !isNilOrError(appConfig)
    ? appConfig.data.attributes.settings.core.locales
    : [];
  const iconDivRef = useRef<HTMLDivElement | null>(null);
  const authUser = useAuthUser();
  const [isUserMenuPopupOpen, setIsUserMenuPopupOpen] = useState(false);
  const [isLanguagePopupOpen, setIsLanguagePopupOpen] = useState(false);

  const handleUserMenuPopupClose = () => {
    // We only close the user menu popup if no other popup is open
    if (!isLanguagePopupOpen) {
      setIsUserMenuPopupOpen(false);
    }
  };

  if (isNilOrError(authUser)) {
    return null;
  }

  const getRole = (user: IUserData): MessageDescriptor => {
    const highestRole = user.attributes.highest_role;
    const roleMessage = {
      admin: messages.administrator,
      super_admin: messages.administrator,
      project_folder_moderator: messages.folderManager,
      project_moderator: messages.projectManager,
    };

    return roleMessage[highestRole];
  };

  return (
    <Popup
      trigger={
        <StyledBox
          as="button"
          width="100%"
          display="flex"
          justifyContent="flex-start"
          onClick={() => setIsUserMenuPopupOpen(true)}
          p="0px"
        >
          <Box
            display="flex"
            alignItems="center"
            w="100%"
            pr="8px"
            pl="16px"
            py="10px"
          >
            <Avatar userId={authUser.id} size={24} addVerificationBadge />
            <Box
              display="flex"
              flex="1"
              flexDirection="column"
              w="100%"
              ml="7px"
              overflow="hidden"
            >
              <Text
                color="white"
                my="0px"
                fontSize="m"
                textOverflow="ellipsis"
                whiteSpace="nowrap"
                overflow="hidden"
                w="100%"
                textAlign="left"
                fontWeight="bold"
              >
                {`${authUser.attributes.first_name} ${authUser.attributes.last_name}`}
              </Text>
              <Box opacity={0.5}>
                <Text
                  color="white"
                  my="0px"
                  fontSize="xs"
                  textOverflow="ellipsis"
                  whiteSpace="nowrap"
                  overflow="hidden"
                  w="100%"
                  textAlign="left"
                >
                  {formatMessage({ ...getRole(authUser) })}
                </Text>
              </Box>
            </Box>
            <Box ref={iconDivRef}>
              <Icon name="chevron-right" fill={colors.white} />
            </Box>
          </Box>
        </StyledBox>
      }
      open={isUserMenuPopupOpen}
      onClose={handleUserMenuPopupClose}
      on="click"
      position="top right"
      offset={[40, -60]}
      positionFixed
      context={iconDivRef}
      basic
      wide
    >
      <Box width="224px">
        {tenantLocales.length > 1 && locale && (
          <ItemMenu
            buttonStyle="text"
            onClick={() => setIsLanguagePopupOpen(!isLanguagePopupOpen)}
          >
            <StyleIconBox
              display="flex"
              justifyContent="space-between"
              w="100%"
            >
              <LanguageSelectorPopup
                setIsOpen={setIsLanguagePopupOpen}
                isOpen={isLanguagePopupOpen}
              />
            </StyleIconBox>
          </ItemMenu>
        )}
        <ItemMenu
          linkTo={`/profile/${authUser.attributes.slug}`}
          buttonStyle="text"
        >
          <Box display="flex" justifyContent="space-between" w="100%">
            {formatMessage({ ...messages.myProfile })}
          </Box>
        </ItemMenu>
        <ItemMenu buttonStyle="text" onClick={signOut}>
          <StyleIconBox display="flex" justifyContent="space-between" w="100%">
            {formatMessage({ ...messages.signOut })}
            <Icon name="power" fill={colors.grey300} />
          </StyleIconBox>
        </ItemMenu>
      </Box>
    </Popup>
  );
};
