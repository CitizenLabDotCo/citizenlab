import React, { useState, useRef } from 'react';

import {
  Box,
  Icon,
  Text,
  useBreakpoint,
  colors,
  Dropdown,
} from '@citizenlab/cl2-component-library';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import signOut from 'api/authentication/sign_in_out/signOut';
import useAuthUser from 'api/me/useAuthUser';
import { IUserData } from 'api/users/types';

import Avatar from 'components/Avatar';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import { getFullName } from 'utils/textUtils';

import LanguageSelectorPopup from './LanguageSelectorPopup';
import messages from './messages';
import { ItemMenu, StyledBox } from './styles';

export const UserMenu = () => {
  const { formatMessage } = useIntl();
  const { data: appConfig } = useAppConfiguration();
  const isSmallerThanPhone = useBreakpoint('tablet');
  const tenantLocales = !isNilOrError(appConfig)
    ? appConfig.data.attributes.settings.core.locales
    : [];
  const iconDivRef = useRef<HTMLDivElement | null>(null);
  const { data: authUser } = useAuthUser();
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
    <StyledBox
      as="button"
      width={isSmallerThanPhone ? '56px' : '100%'}
      display="flex"
      justifyContent="flex-start"
      onClick={() => setIsUserMenuPopupOpen(true)}
      p="0px"
      position="relative"
    >
      <Box
        display="flex"
        alignItems="center"
        w="100%"
        p={isSmallerThanPhone ? '10px 0' : '10px 8px 10px 16px'}
        justifyContent={isSmallerThanPhone ? 'center' : undefined}
      >
        {/*
              Margins are needed to align with other icons/items in sidebar.
              Changes in Avatar component are needed so size prop behaves correctly.
            */}
        <Box
          ml={isSmallerThanPhone ? '0' : '-2px'}
          mr={isSmallerThanPhone ? '0' : '6px'}
        >
          <Avatar userId={authUser.data.id} size={20} />
        </Box>
        {!isSmallerThanPhone && (
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
            >
              {getFullName(authUser.data)}
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
                {formatMessage({ ...getRole(authUser.data) })}
              </Text>
            </Box>
          </Box>
        )}
        <Box ref={iconDivRef}>
          {!isSmallerThanPhone && (
            <Icon name="chevron-right" fill={colors.white} />
          )}
        </Box>
      </Box>
      <Dropdown
        opened={isUserMenuPopupOpen}
        onClickOutside={handleUserMenuPopupClose}
        left={isSmallerThanPhone ? '60px' : '200px'}
        top="-40px"
        content={
          <Box>
            {tenantLocales.length > 1 && (
              <ItemMenu
                buttonStyle="text"
                onClick={() => setIsLanguagePopupOpen(!isLanguagePopupOpen)}
              >
                <Box display="flex" justifyContent="space-between" w="100%">
                  <LanguageSelectorPopup
                    setIsOpen={setIsLanguagePopupOpen}
                    isOpen={isLanguagePopupOpen}
                  />
                </Box>
              </ItemMenu>
            )}
            <ItemMenu
              linkTo={`/profile/${authUser.data.attributes.slug}`}
              buttonStyle="text"
            >
              <Box display="flex" justifyContent="space-between" w="100%">
                <Text my="0px" color="coolGrey600">
                  {formatMessage({ ...messages.myProfile })}
                </Text>
                <Icon name="user" fill={colors.grey600} />
              </Box>
            </ItemMenu>
            <ItemMenu buttonStyle="text" onClick={signOut}>
              <Box display="flex" justifyContent="space-between" w="100%">
                <Text my="0px" color="coolGrey600">
                  {formatMessage({ ...messages.signOut })}
                </Text>
                <Icon name="power" fill={colors.grey600} />
              </Box>
            </ItemMenu>
          </Box>
        }
      />
    </StyledBox>
  );
};
