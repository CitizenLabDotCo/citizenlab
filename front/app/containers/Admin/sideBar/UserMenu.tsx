import React from 'react';
import { rgba } from 'polished';

// components
import { Box, Icon, Text } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import { Popup } from 'semantic-ui-react';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// hooks
import useAuthUser from 'hooks/useAuthUser';

// utils
import { isNilOrError } from 'utils/helperUtils';
import Avatar from 'components/Avatar';

// services
import { signOut } from 'services/auth';

const ItemMenu = styled(Button)`
  color: ${colors.coolGrey600};
  display: flex;
  align-items: center;
  width: 100%;
  &:hover {
    color: ${colors.coolGrey600};
    background: ${rgba(colors.teal400, 0.07)};
  }
  span {
    width: 100%;
  }
`;

const StyledBox = styled(Box)`
  cursor: pointer;
  &:hover {
    background: rgba(0, 0, 0, 0.36);
  }
`;

export const UserMenu = () => {
  const { formatMessage } = useIntl();
  const authUser = useAuthUser();

  if (isNilOrError(authUser)) {
    return null;
  }

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
            {formatMessage({ ...messages.notifications })}
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
