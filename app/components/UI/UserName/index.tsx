import React from 'react';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import styled from 'styled-components';
import { IUserData } from 'services/users';
import { get } from 'lodash-es';

const User = styled.span`
  word-break: break-all;
  hyphens: auto;

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
  const firstName = get(user, 'attributes.first_name', '');
  const lastName = get(user, 'attributes.last_name', '');

  return (
    <User className={`${className} ${!user ? 'deleted-user' : ''}`}>
      {user ? (
        `${firstName} ${!hideLastName && lastName ? lastName : ''}`
      ) : (
        <FormattedMessage {...messages.deletedUser} />
      )}
    </User>
  );
};
