import React from 'react';
import { adopt } from 'react-adopt';
import styled from 'styled-components';
import { get } from 'lodash-es';
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
  cursor: pointer;
  hyphens: auto;

  &.deleted-user {
    font-style: italic;
  }

  &.canModerate {
    color: ${colors.clRedError};

    &:hover {
      color: ${darken(0.15, colors.clRedError)};
    }
  }

  &:hover {
    color: ${({ theme }) => darken(0.15, theme.colorText)};
    text-decoration: underline;
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
}

interface Props extends InputProps, DataProps {}

const UserName = React.memo<Props>(({ user, className, hideLastName, linkToProfile, emphasize }) => {

  if (!isNilOrError(user)) {
    const firstName = get(user, 'attributes.first_name', '');
    const lastName = get(user, 'attributes.last_name', '');

    return linkToProfile ? (
      <Link to={`/profile/${user.attributes.slug}`} className="e2e-idea-author-link">
        <Name emphasize={emphasize} className={`${className} e2e-username`}>
          `${firstName} ${hideLastName ? '' : lastName}`
        </Name>
      </Link>
    ) : (
      <Name emphasize={emphasize} className={`${className} e2e-username`}>
        `${firstName} ${hideLastName ? '' : lastName}`
      </Name>
    );
  }

  return (
    <Name className={`${className} deleted-user e2e-username`}>
      <FormattedMessage {...messages.deletedUser} />
    </Name>
  );

});

const Data = adopt<DataProps, InputProps>({
  user: ({ userId, render }) => <GetUser id={userId}>{render}</GetUser>
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <UserName {...inputProps} {...dataProps} />}
  </Data>
);
