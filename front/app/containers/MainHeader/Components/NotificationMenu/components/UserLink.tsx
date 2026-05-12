import React from 'react';

import styled from 'styled-components';

import { FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { isNilOrError, stopPropagation } from 'utils/helperUtils';

import messages from '../messages';

const DeletedUserSpan = styled.span`
  font-style: italic;
`;

export const DeletedUser = () => (
  <DeletedUserSpan>
    <FormattedMessage {...messages.deletedUser} />
  </DeletedUserSpan>
);

const UserLink = ({ userName, userId }) => {
  const deletedUser = isNilOrError(userName) || isNilOrError(userId);

  return deletedUser ? (
    <DeletedUser />
  ) : (
    <Link to={`/profile/${userId}`} onClick={stopPropagation}>
      {userName}
    </Link>
  );
};

export default UserLink;
