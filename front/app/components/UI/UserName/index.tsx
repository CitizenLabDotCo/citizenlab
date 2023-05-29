import React from 'react';
import Link from 'utils/cl-router/Link';

// styles
import { darken } from 'polished';
import { colors, fontSizes } from 'utils/styleUtils';
import styled from 'styled-components';

// hooks
import useUserById from 'api/users/useUserById';

// services
import { IUserData } from 'api/users/types';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';
import messages from './messages';

const Name = styled.span<{
  color?: string;
  fontWeight?: number;
  fontSize?: number;
  underline?: boolean;
}>`
  color: ${({ color, theme }) => color || theme.colors.tenantText};
  font-weight: ${({ fontWeight }) => fontWeight || 400};
  font-size: ${({ fontSize }) => fontSize || fontSizes.base}px;
  text-decoration: ${({ underline }) => (underline ? 'underline' : 'none')};
  hyphens: auto;

  &.isLinkToProfile {
    &:hover {
      text-decoration: underline;
      color: ${({ color, theme }) =>
        darken(0.15, color || theme.colors.tenantText)};
    }
  }

  &.canModerate {
    color: ${colors.red600};

    &:hover {
      color: ${darken(0.15, colors.red600)};
    }
  }

  // this one has to stay at the bottom to
  // overwrite the styles when there's no user
  &.isUnknownUser {
    font-style: italic;
    text-decoration: none;

    &:hover {
      text-decoration: none;
      color: ${({ color, theme }) => color || theme.colors.tenantText};
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

const UserName = (props: Props & WrappedComponentProps) => {
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
  const { data: user } = useUserById(userId);

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

  if (user) {
    const getName = (user: IUserData) => {
      const firstName = user.attributes.first_name;
      const lastName = user.attributes.last_name;
      return `${firstName} ${!hideLastName && lastName ? lastName : ''}`;
    };
    const name = getName(user.data);
    const profileLink = `/profile/${user.data.attributes.slug}`;

    const classNames = `
      ${className || ''}
      ${canModerate ? 'canModerate' : ''}
      ${isLinkToProfile ? 'isLinkToProfile' : ''}
      e2e-username
    `;

    if (isLinkToProfile) {
      return (
        <Link to={profileLink} className={`e2e-author-link ${className || ''}`}>
          <Name
            fontWeight={fontWeight}
            fontSize={fontSize}
            underline={underline}
            className={classNames}
            color={color}
          >
            {name}
          </Name>
        </Link>
      );
    } else {
      return (
        <Name
          fontWeight={fontWeight}
          fontSize={fontSize}
          underline={underline}
          className={classNames}
          color={color}
        >
          {name}
        </Name>
      );
    }
  }

  return null;
};

export default injectIntl(UserName);
