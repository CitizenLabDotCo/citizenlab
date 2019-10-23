import React, { memo } from 'react';
import { adopt } from 'react-adopt';
import styled from 'styled-components';
import { get } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';

// styles
import { darken } from 'polished';
import { colors, fontSizes } from 'utils/styleUtils';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// resources
import GetUser, { GetUserChildProps } from 'resources/GetUser';

// components
import FeatureFlag from 'components/FeatureFlag';
import Link from 'utils/cl-router/Link';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  display: inline-block;
`;

const Name: any = styled.div<{ color?: string }>`
  color: ${({ color, theme }) => color || theme.colorText};
  font-weight: ${({ emphasize }: any) => emphasize ? '500' : 'normal'};
  text-decoration: none;
  hyphens: auto;

  &.linkToProfile {
    transition: all 100ms ease-out;

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

const Badge = styled.div`
  color: #fff;
  font-size: ${fontSizes.xs}px;
  line-height: 16px;
  border-radius: ${(props: any) => props.theme.borderRadius};
  padding: 1px 4px;
  text-transform: uppercase;
  text-align: center;
  font-weight: 700;
  background-color: ${(props: any) => props.color};
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

interface Props extends InputProps, DataProps { }

const UserName = memo<Props>(({ user, className, hideLastName, linkToProfile, emphasize, canModerate, color, verificationBadge }) => {
  if (!isNilOrError(user)) {
    const firstName = get(user, 'attributes.first_name', '');
    const lastName = get(user, 'attributes.last_name', '');
    const nameComponent = (
      <Name
        emphasize={emphasize}
        className={
          `${linkToProfile ? 'linkToProfile' : ''}
          ${canModerate ? 'canModerate' : ''}
          e2e-username`
        }
        color={color}
      >
        {`${firstName} ${hideLastName ? '' : lastName}`}
      </Name>
    );
    const verificationBadgeComponent = (isVerified?: boolean) => (
      <FeatureFlag name="verification">
        <Badge color={isVerified ? colors.clGreen : colors.label}>
          {isVerified
            ? <FormattedMessage {...messages.verified} />
            : <FormattedMessage {...messages.notVerified} />
          }
        </Badge>
      </FeatureFlag>
    );

    if (linkToProfile) {
      return (
        <Link to={`/profile/${user.attributes.slug}`} className={`e2e-author-link ${className || ''}`}>
          <Container>
            {nameComponent}
            {verificationBadge && verificationBadgeComponent(user.attributes.verified)}
          </Container>
        </Link>
      );
    }

    return (
      <Container className={className || ''}>
        {nameComponent}
        {verificationBadge && verificationBadgeComponent(user.attributes.verified)}
      </Container>
    );
  }

  return (
    <Name color={color} className={`${className} deleted-user e2e-username`}>
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
