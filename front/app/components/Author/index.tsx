import React, { memo } from 'react';

import {
  media,
  colors,
  fontSizes,
  isRtl,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useUserById from 'api/users/useUserById';

import useLocale from 'hooks/useLocale';

import Avatar from 'components/Avatar';
import UserName from 'components/UI/UserName';

import { ScreenReaderOnly } from 'utils/a11y';
import { FormattedMessage } from 'utils/cl-intl';
import { timeAgo } from 'utils/dateUtils';
import { isNilOrError } from 'utils/helperUtils';
import { canModerateInitiative } from 'utils/permissions/rules/initiativePermissions';
import { canModerateProject } from 'utils/permissions/rules/projectPermissions';

import messages from './messages';

const Container = styled.div`
  display: flex;
  justify-content: space-between;

  ${isRtl`
    justify-content: flex-end;
  `}

  ${media.phone`
    flex-direction: column;
  `}
`;

const AuthorContainer = styled.div`
  display: flex;
  align-items: center;
  margin: 0;
  padding: 0;

  ${isRtl`
    flex-direction: row-reverse;
  `}
`;

const StyledAvatar = styled(Avatar)`
  margin-right: 6px;
  margin-bottom: 1px;

  ${isRtl`
    margin-right: 0;
    margin-left: 6px;
  `}
`;

const AuthorMeta = styled.div`
  &.horizontalLayout {
    display: flex;
    flex-wrap: wrap;
    align-items: center;

    ${isRtl`
        flex-direction: row-reverse;
    `}
  }
`;

const AuthorNameContainer = styled.div`
  display: flex;
  align-items: center;
  color: ${colors.textSecondary};
  font-size: ${fontSizes.base}px;
  line-height: 16px;
  text-decoration: none;

  &.horizontalLayout {
    margin-right: 10px;

    ${isRtl`
        margin-right: 0;
        margin-left: 10px;
    `}
  }
`;

const TimeAgo = styled.div`
  color: ${colors.textSecondary};
  font-size: ${fontSizes.s}px;
  line-height: 16px;
  margin-top: 3px;

  &.horizontalLayout {
    margin-top: 2px;
  }
`;

export interface Props {
  authorId: string | null;
  createdAt: string;
  size: number;
  isLinkToProfile?: boolean;
  projectId?: string | null;
  showAvatar?: boolean;
  avatarBadgeBgColor?: string;
  showModeration?: boolean; // will show red styling on admins and moderators of projectId
  fontWeight?: number;
  fontSize?: number;
  className?: string;
  horizontalLayout?: boolean;
  underline?: boolean;
  color?: string;
  authorHash?: string;
  anonymous?: boolean;
  postType: 'idea' | 'initiative';
}

const Author = memo(
  ({
    authorId,
    authorHash,
    createdAt,
    size,
    isLinkToProfile,
    projectId,
    showAvatar = true,
    showModeration,
    className,
    avatarBadgeBgColor,
    fontWeight,
    fontSize,
    horizontalLayout,
    color,
    underline,
    anonymous,
    postType,
  }: Props) => {
    const locale = useLocale();
    const { data: author } = useUserById(authorId);
    // Ideally this is managed outside of this component.
    const canModerate = author
      ? {
          idea: canModerateProject(projectId, author),
          initiative: canModerateInitiative(author),
        }[postType]
      : false;
    const showModerationStyles = showModeration && canModerate;

    if (!isNilOrError(locale)) {
      return (
        <Container className={className}>
          <AuthorContainer>
            {showAvatar && (
              <StyledAvatar
                userId={authorId}
                authorHash={authorHash}
                size={size}
                isLinkToProfile={isLinkToProfile}
                moderator={showModerationStyles}
                bgColor={avatarBadgeBgColor}
              />
            )}

            <AuthorMeta className={horizontalLayout ? 'horizontalLayout' : ''}>
              <AuthorNameContainer
                className={horizontalLayout ? 'horizontalLayout' : ''}
              >
                <ScreenReaderOnly>
                  <FormattedMessage {...messages.a11y_postedBy} />:
                </ScreenReaderOnly>
                <UserName
                  userId={authorId}
                  isLinkToProfile={isLinkToProfile}
                  canModerate={showModerationStyles}
                  fontWeight={fontWeight}
                  fontSize={fontSize}
                  color={color}
                  underline={underline}
                  anonymous={anonymous}
                />
              </AuthorNameContainer>
              <TimeAgo className={horizontalLayout ? 'horizontalLayout' : ''}>
                {timeAgo(Date.parse(createdAt), locale)}
              </TimeAgo>
            </AuthorMeta>
          </AuthorContainer>
        </Container>
      );
    }
    return null;
  }
);

export default Author;
