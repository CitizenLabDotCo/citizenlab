import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import Link from 'utils/cl-router/Link';

// styles
import { darken } from 'polished';
import { colors, fontSizes } from 'utils/styleUtils';
import styled from 'styled-components';

// hooks
import useUser from 'hooks/useUser';

// services
import { IUserData } from 'services/users';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

const Name = styled.span<{
  color?: string;
  fontWeight?: number;
  fontSize?: number;
  underline?: boolean;
}>`
  color: ${({ color, theme }) => color || theme.colorText};
  font-weight: ${({ fontWeight }) => fontWeight || 400};
  font-size: ${({ fontSize }) => fontSize || fontSizes.base}px;
  text-decoration: ${({ underline }) => (underline ? 'underline' : 'none')};
  hyphens: auto;

  &.isLinkToProfile {
    &:hover {
      text-decoration: underline;
      color: ${({ color, theme }) => darken(0.15, color || theme.colorText)};
    }
  }

  &.canModerate {
    color: ${colors.clRedError};

    &:hover {
      color: ${darken(0.15, colors.clRedError)};
    }
  }

  // this one has to stay at the bottom to
  // overwrite the styles when there's no user
  &.isUnknownUser {
    font-style: italic;
    text-decoration: none;

    &:hover {
      text-decoration: none;
      color: ${({ color, theme }) => color || theme.colorText};
    }
  }
`;

interface StyleProps {
  fontWeight?: number;
  fontSize?: number;
  underline?: boolean;
  color?: string;
  canModerate?: boolean;
}

interface Props extends StyleProps {
  // if user was deleted, userId can be null
  userId: string | null;
  className?: string;
  isLinkToProfile?: boolean;
  hideLastName?: boolean;
}

const UserName = (props: Props & InjectedIntlProps) => {
  const {
    intl: { formatMessage },
    userId,
    className,
    isLinkToProfile,
    hideLastName,
    fontWeight,
    fontSize,
    underline,
    color,
    canModerate,
  } = props;
  const user = useUser({ userId });

  if (userId === null) {
    // Deleted user
    return (
      <Name
        fontWeight={fontWeight}
        fontSize={fontSize}
        underline={underline}
        className={`
      ${className || ''}
      isUnknownUser
      e2e-username
    `}
        color={color}
      >
        {formatMessage(messages.deletedUser)}
      </Name>
    );
  }

  if (!isNilOrError(user)) {
    const getName = (user: IUserData) => {
      const firstName = user.attributes.first_name;
      const lastName = user.attributes.last_name;
      return `${firstName} ${!hideLastName && lastName ? lastName : ''}`;
    };
    const name = getName(user);
    const profileLink = `/profile/${user.attributes.slug}`;

    const NameComponent = (
      <Name
        fontWeight={fontWeight}
        fontSize={fontSize}
        underline={underline}
        className={`
          ${className || ''}
          ${canModerate ? 'canModerate' : ''}
          ${isLinkToProfile ? 'isLinkToProfile' : ''}
          e2e-username
        `}
        color={color}
      >
        {name}
      </Name>
    );

    if (isLinkToProfile) {
      return (
        <Link to={profileLink} className={`e2e-author-link ${className || ''}`}>
          {NameComponent}
        </Link>
      );
    } else {
      return NameComponent;
    }
  }

  return null;
};

export default injectIntl(UserName);
