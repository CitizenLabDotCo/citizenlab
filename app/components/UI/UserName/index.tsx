import React from 'react';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import styled from 'styled-components';
import { IUserData } from 'services/users';

const User = styled.span`
  &.deleted-user {
    font-style: italic;
  }
`;

export default ({ user }: { user: IUserData | null }) => {
  if (!user) {
    return (<User className="deleted-user"><FormattedMessage {...messages.deletedUser} /></User>);
  }

  return (<User>{`${user.attributes.first_name} ${user.attributes.last_name || ''}`}</User>);
};
