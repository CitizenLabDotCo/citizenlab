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
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

// components
import Tippy from '@tippyjs/react';
import { Box, Text } from '@citizenlab/cl2-component-library';

const Name = styled.span<{
  color?: string;
  fontWeight?: number;
  fontSize?: number;
  underline?: boolean;
  italic?: boolean;
}>`
  color: ${({ color, theme }) => color || theme.colors.tenantText};
  font-weight: ${({ fontWeight }) => fontWeight || 400};
  font-size: ${({ fontSize }) => fontSize || fontSizes.base}px;
  text-decoration: ${({ underline }) => (underline ? 'underline' : 'none')};
  font-style: ${({ italic }) => (italic ? 'italic' : 'normal')};
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
  italic?: boolean;
  color?: string;
}

interface Props extends StyleProps {
  // if user was deleted, userId can be null
  userId: string | null;
  className?: string;
  isLinkToProfile?: boolean;
  hideLastName?: boolean;
  anonymous?: boolean;
  canModerate?: boolean;
}

const UserName = ({
  userId,
  className,
  isLinkToProfile,
  hideLastName,
  fontWeight,
  fontSize,
  underline,
  italic,
  color,
  canModerate,
  anonymous,
}: Props) => {
  const { formatMessage } = useIntl();
  const { data: user } = useUserById(userId);

  const sharedNameProps: StyleProps = {
    fontWeight,
    fontSize,
    underline,
    italic,
    color,
  };

  if (anonymous) {
    return (
      <Tippy
        placement="top-start"
        maxWidth={'260px'}
        theme={'dark'}
        content={
          <Box style={{ cursor: 'default' }}>
            <Text my="8px" color="white" fontSize="s">
              {formatMessage(messages.anonymousTooltip)}
            </Text>
          </Box>
        }
      >
        <Name
          id="e2e-anonymous-username"
          className={`${className || ''} e2e-username`}
          {...sharedNameProps}
        >
          {formatMessage(messages.anonymous)}
        </Name>
      </Tippy>
    );
  }

  if (userId === null) {
    // Deleted user
    return (
      <Name
        {...sharedNameProps}
        className={`
      ${className || ''}
      isUnknownUser
      e2e-username
    `}
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
          <Name {...sharedNameProps} className={classNames}>
            {name}
          </Name>
        </Link>
      );
    } else {
      return (
        <Name {...sharedNameProps} className={classNames}>
          {name}
        </Name>
      );
    }
  }

  return null;
};

export default UserName;
