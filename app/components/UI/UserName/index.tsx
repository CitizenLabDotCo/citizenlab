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
import VerificationBadge from './VerificationBadge';

const Container = styled.div`
  display: inline-block;
`;

const Name = styled.div<{ color?: string; emphasize?: boolean }>`
  color: ${({ color, theme }) => color || theme.colorText};
  font-weight: ${({ emphasize }) => (emphasize ? 500 : 'normal')};
  text-decoration: none;
  hyphens: auto;

  &.linkToProfile {
    transition: all 80ms ease-out;

    &:hover {
      cursor: pointer;
      color: ${({ color, theme }) => darken(0.15, color || theme.colorText)};
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
  color?: string;
  verificationBadge?: boolean;
}

interface Props extends InputProps, DataProps {}

const UserName = ({
  user,
  className,
  hideLastName,
  linkToProfile,
  emphasize,
  canModerate,
  color,
  verificationBadge,
}: Props) => {
  if (!isNilOrError(user)) {
    const firstName = get(user, 'attributes.first_name', '');
    const lastName = get(user, 'attributes.last_name', '');
    const isVerified = !!user.attributes.verified;

    return (
      <Container className={className || ''}>
        <Name
          emphasize={emphasize}
          className={`${linkToProfile ? 'linkToProfile' : ''}
          ${canModerate ? 'canModerate' : ''}
          e2e-username`}
          color={color}
        >
          {`${firstName} ${hideLastName ? '' : lastName}`}
        </Name>{' '}
        {verificationBadge && <VerificationBadge isVerified={isVerified} />}
      </Container>
    );
  }

  return (
    <Name color={color} className={`${className} deleted-user e2e-username`}>
      <FormattedMessage {...messages.deletedUser} />
    </Name>
  );
};

const Data = adopt<DataProps, InputProps>({
  user: ({ userId, render }) => <GetUser id={userId}>{render}</GetUser>,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <UserName {...inputProps} {...dataProps} />}
  </Data>
);
