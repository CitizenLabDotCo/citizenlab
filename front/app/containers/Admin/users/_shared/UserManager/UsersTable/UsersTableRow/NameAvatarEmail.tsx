import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { IUserData } from 'api/users/types';

import Avatar from 'components/Avatar';

import Link from 'utils/cl-router/Link';
import { getFullName } from 'utils/textUtils';

const StyledLink = styled(Link)`
  cursor: pointer;
  color: inherit;

  &:hover {
    color: inherit;
    text-decoration: underline;
  }
`;

interface Props {
  user: IUserData;
}

const NameAvatarEmail = ({ user }: Props) => {
  return (
    <Box display="flex" alignItems="center" gap="8px">
      <Avatar userId={user.id} size={30} />
      <Box>
        <StyledLink to={`/profile/${user.id}`}>{getFullName(user)}</StyledLink>
        <Text fontSize="s" m="0px" color="textSecondary">
          {user.attributes.email}
        </Text>
      </Box>
    </Box>
  );
};

export default NameAvatarEmail;
