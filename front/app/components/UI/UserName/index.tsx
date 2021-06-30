import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import Link from 'utils/cl-router/Link';

// styles
import { darken } from 'polished';
import { colors, fontSizes } from 'utils/styleUtils';
import styled from 'styled-components';

// resources
import useUser from 'hooks/useUser';

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
  let isUnknownUser = false;
  const user = useUser({ userId });

  const getName = () => {
    if (!isNilOrError(user)) {
      const firstName = user.attributes.first_name;
      const lastName = user.attributes.last_name;
      if (firstName) {
        // Sometimes we have a user, but names don't load (only seen in dev mode)
        // Built in this check to make sure we don't show an empty space (in production)
        // See Name.tsx for why only firstName is required
        return `${firstName} ${!hideLastName && lastName ? lastName : ''}`;
      }
    }

    isUnknownUser = true;
    return formatMessage(messages.deletedUser);
  };

  const getProfileLink = () => {
    if (
      !isNilOrError(user) &&
      // It only makes sense to link to profile when we see a name,
      // we don't want to link to the profile of an unknown user
      user.attributes.first_name &&
      user.attributes.slug
    ) {
      return `/profile/${user.attributes.slug}`;
    }

    return null;
  };

  const name = getName();
  const profileLink = getProfileLink();

  const NameComponent = (
    <Name
      fontWeight={fontWeight}
      fontSize={fontSize}
      underline={underline}
      className={`
        ${className || ''}
        ${canModerate ? 'canModerate' : ''}
        ${isUnknownUser ? 'isUnknownUser' : ''}
        ${isLinkToProfile ? 'isLinkToProfile' : ''}
        e2e-username
      `}
      color={color}
    >
      {name}
    </Name>
  );

  if (isLinkToProfile && profileLink) {
    return (
      <Link to={profileLink} className={`e2e-author-link ${className || ''}`}>
        {NameComponent}
      </Link>
    );
  }

  return NameComponent;
};

export default injectIntl(UserName);
