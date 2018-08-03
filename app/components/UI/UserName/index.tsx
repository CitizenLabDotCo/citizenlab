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

interface Props {
  user: IUserData | null;
  hideLastName?: boolean;
  className?: string;
}

export default (props: Props) => {
  const { user, className, hideLastName } = props;
  const firstName = (user ? user.attributes.first_name : null);
  const lastName = (user && !hideLastName ? user.attributes.last_name : null);

  return (
    <User className={`${className} ${!user ? 'deleted-user' : ''}`}>
      {user ? (
        `${firstName} ${lastName}`
      ) : (
        <FormattedMessage {...messages.deletedUser} />
      )}
    </User>
  );
};
