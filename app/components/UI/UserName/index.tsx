// Libraries
import * as React from 'react';

// I18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// Style
import styled from 'styled-components';

const User = styled.span`
  &.deleted-user {
    font-style: italic;
  }
`;

// Typings
import { IUser } from 'services/users';
interface Props {
  user: IUser | null;
}

const UserName: React.SFC<Props> = ({ user }) => {
  if (!user) {
    return (<User className="deleted-user"><FormattedMessage {...messages.deletedUser} /></User>);
  } else {
    return (<User>{`${user.data.attributes.first_name} ${user.data.attributes.last_name || ''}`}</User>);
  }
};

export default UserName;
