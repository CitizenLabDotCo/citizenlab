import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import Avatar from 'components/Avatar';
import UserName from 'components/UI/UserName';

// services
import { canModerateProject } from 'services/permissions/rules/projectPermissions';

// hooks
import useUser from 'hooks/useUser';

// i18n
import { FormattedRelative } from 'react-intl';

// style
import styled from 'styled-components';
import { media, colors, fontSizes, isRtl } from 'utils/styleUtils';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import { ScreenReaderOnly } from 'utils/a11y';

const Container = styled.div`
  display: flex;
  justify-content: space-between;

  ${isRtl`
    justify-content: flex-end;
  `}

  ${media.smallPhone`
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
  color: ${colors.label};
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
  color: ${colors.label};
  font-size: ${fontSizes.small}px;
  line-height: 16px;
  margin-top: 3px;

  &.horizontalLayout {
    margin-top: 2px;
  }
`;

export interface Props {
  authorId: string | null;
  createdAt?: string;
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
}

const Author = memo(
  ({
    authorId,
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
  }: Props) => {
    const author = useUser({ userId: authorId });
    const authorCanModerate =
      !isNilOrError(author) &&
      showModeration &&
      canModerateProject(projectId, { data: author });

    return (
      <Container className={className}>
        <AuthorContainer>
          {showAvatar && (
            <StyledAvatar
              userId={authorId}
              size={size}
              isLinkToProfile={isLinkToProfile}
              moderator={authorCanModerate}
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
                canModerate={authorCanModerate}
                fontWeight={fontWeight}
                fontSize={fontSize}
                color={color}
                underline={underline}
              />
            </AuthorNameContainer>

            {createdAt && (
              <TimeAgo className={horizontalLayout ? 'horizontalLayout' : ''}>
                <FormattedRelative value={createdAt} />
              </TimeAgo>
            )}
          </AuthorMeta>
        </AuthorContainer>
      </Container>
    );
  }
);

export default Author;
