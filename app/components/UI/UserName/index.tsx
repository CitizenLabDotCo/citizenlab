import React from 'react';
import { adopt } from 'react-adopt';
import styled from 'styled-components';
import { get, isString } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';

// styles
import { darken } from 'polished';
import { colors } from 'utils/styleUtils';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// resources
import GetUser, { GetUserChildProps } from 'resources/GetUser';

// components
import Link from 'utils/cl-router/Link';

const Name: any = styled.span`
  color: ${({ theme }) => theme.colorText};
  font-weight: ${({ emphasize }: any) => emphasize ? '500' : 'normal'};
  text-decoration: none;
  hyphens: auto;

  &.linkToProfile {
    &:hover {
      cursor: pointer;
      color: ${({ theme }) => darken(0.15, theme.colorText)};
      text-decoration: underline;
    }

    &.canModerate {
      color: ${colors.clRedError};

      &:hover {
        color: ${darken(0.15, colors.clRedError)};
      }
    }
  }

  &.deleted-user {
    font-style: italic;
  }
`;

interface DataProps {
  user: GetUserChildProps;
}

interface InputProps {
  userId: string | null;
  hideLastName?: boolean;
  className?: string;
  linkToProfile?: boolean;
  emphasize?: boolean;
  canModerate?: boolean;
}

interface Props extends InputProps, DataProps {}

const UserName = React.memo<Props>(({ user, className, hideLastName, linkToProfile, emphasize, canModerate }) => {
  if (isNilOrError(user)) {
    return (
      <Name className={`${className} deleted-user e2e-username`}>
        <FormattedMessage {...messages.deletedUser} />
      </Name>
    );
  }

  // Make sure to have a fall-back for both null and undefined
  const firstName = isString(get(user, 'attributes.first_name')) ? get(user, 'attributes.first_name') : '';
  const lastName = isString(get(user, 'attributes.last_name')) ? get(user, 'attributes.last_name') : '';
  const nameComponent = (
    <Name
      emphasize={emphasize}
      className={
        `${className || ''}
        ${linkToProfile ? 'linkToProfile' : ''}
        ${canModerate ? 'canModerate' : ''}
        e2e-username`
      }
    >
      {`${firstName} ${hideLastName ? '' : lastName}`}
    </Name>
  );

  if (linkToProfile) {
    return (
      <Link to={`/profile/${user.attributes.slug}`} className="e2e-idea-author-link">
        {nameComponent}
      </Link>
    );
  }

  return nameComponent;

});

const Data = adopt<DataProps, InputProps>({
  user: ({ userId, render }) => <GetUser id={userId}>{render}</GetUser>
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <UserName {...inputProps} {...dataProps} />}
  </Data>
);
