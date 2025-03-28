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
import LocaleSelectorPopup from './LocaleSelectorPopup';
import messages from './messages';
import { ItemMenu, StyledBox, StyledText } from './styles';

export const UserMenu = () => {
  const { formatMessage } = useIntl();
  const { data: appConfig } = useAppConfiguration();
  const isSmallerThanTablet = useBreakpoint('tablet');
  const tenantLocales = !isNilOrError(appConfig)
    ? appConfig.data.attributes.settings.core.locales
    : [];
  const iconDivRef = useRef<HTMLDivElement | null>(null);
  const { data: authUser } = useAuthUser();
  const [isUserMenuPopupOpen, setIsUserMenuPopupOpen] = useState(false);
  const [isLocaleSelectorOpen, setIsLocaleSelectorOpen] = useState(false);

  const handleUserMenuPopupClose = () => {
    // We only close the user menu popup if no other popup is open
    if (!isLocaleSelectorOpen) {
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
      width={isSmallerThanTablet ? '56px' : '100%'}
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
        p={isSmallerThanTablet ? '10px 0' : '10px 8px 10px 16px'}
        justifyContent={isSmallerThanTablet ? 'center' : undefined}
      >
        {/*
              Margins are needed to align with other icons/items in sidebar.
              Changes in Avatar component are needed so size prop behaves correctly.
            */}
        <Box
          ml={isSmallerThanTablet ? '0' : '-2px'}
          mr={isSmallerThanTablet ? '0' : '6px'}
        >
          <Avatar userId={authUser.data.id} size={20} />
        </Box>
        {!isSmallerThanTablet && (
          <Box
            display="flex"
            flex="1"
            flexDirection="column"
            w="100%"
            ml="7px"
            overflow="hidden"
          >
            <StyledText
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
            </StyledText>
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
          {!isSmallerThanTablet && (
            <Icon name="chevron-right" fill={colors.white} />
          )}
        </Box>
      </Box>
      <Dropdown
        opened={isUserMenuPopupOpen}
        onClickOutside={handleUserMenuPopupClose}
        left={isSmallerThanTablet ? '60px' : '200px'}
        mobileLeft="60px"
        top="-40px"
        content={
          <Box>
            {tenantLocales.length > 1 && (
              <ItemMenu
                buttonStyle="text"
                onClick={() => setIsLocaleSelectorOpen(!isLocaleSelectorOpen)}
              >
                <Box display="flex" justifyContent="space-between" w="100%">
                  <LanguageSelectorPopup
                    setIsLocaleSelectorOpen={setIsLocaleSelectorOpen}
                    isLocaleSelectorOpen={isLocaleSelectorOpen}
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

      <LocaleSelectorPopup
        isLocaleSelectorOpen={isLocaleSelectorOpen}
        setIsLocaleSelectorOpen={setIsLocaleSelectorOpen}
        tenantLocales={tenantLocales}
      />
    </StyledBox>
  );
};
