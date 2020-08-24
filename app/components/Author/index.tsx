import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// components
import Avatar from 'components/Avatar';
import UserName from 'components/UI/UserName';

// services
import { canModerate } from 'services/permissions/rules/projectPermissions';

// resources
import GetUser, { GetUserChildProps } from 'resources/GetUser';

// i18n
import { FormattedRelative } from 'react-intl';

// style
import styled from 'styled-components';
import { media, colors, fontSizes } from 'utils/styleUtils';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import { ScreenReaderOnly } from 'utils/a11y';

const Container = styled.div`
  display: flex;
  justify-content: space-between;

  ${media.smallPhone`
    flex-direction: column;
  `}
`;

const AuthorContainer: any = styled.div`
  display: flex;
  align-items: center;
  margin: 0;
  padding: 0;
`;

const StyledAvatar = styled(Avatar)`
  margin-right: 6px;
  margin-bottom: 1px;
`;

const AuthorMeta = styled.div``;

const AuthorNameContainer = styled.div`
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  line-height: 16px;
  font-weight: 400;
  text-decoration: none;
  hyphens: manual;
`;

const TimeAgo = styled.div`
  color: ${colors.label};
  font-weight: 300;
  font-size: ${fontSizes.small}px;
  line-height: 17px;
  margin-top: 3px;
`;

export interface InputProps {
  authorId: string | null;
  createdAt?: string | undefined;
  size: string;
  notALink?: boolean;
  projectId?: string | null;
  showAvatar?: boolean;
  avatarBadgeBgColor?: string;
  showModeration?: boolean; // will show red styling on admins and moderators of projectId
  emphasize?: boolean;
  className?: string;
}

interface DataProps {
  author: GetUserChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

class Author extends PureComponent<Props, State> {
  static defaultProps = {
    showAvatar: true,
  };

  render() {
    const {
      authorId,
      createdAt,
      size,
      notALink,
      projectId,
      showAvatar,
      showModeration,
      className,
      author,
      avatarBadgeBgColor,
      emphasize,
    } = this.props;
    const authorCanModerate =
      !isNilOrError(author) &&
      showModeration &&
      canModerate(projectId, { data: author });
    const isLinkToProfle = !notALink;
    const authorName = (
      <UserName
        userId={authorId}
        isLinkToProfile={isLinkToProfle}
        canModerate={authorCanModerate}
        emphasize={emphasize}
      />
    );

    return (
      <Container className={className}>
        <AuthorContainer authorCanModerate={authorCanModerate}>
          {showAvatar && (
            <StyledAvatar
              userId={authorId}
              size={size}
              isLinkToProfile={isLinkToProfle}
              moderator={authorCanModerate}
              bgColor={avatarBadgeBgColor}
            />
          )}

          <AuthorMeta>
            <AuthorNameContainer>
              <ScreenReaderOnly>
                <FormattedMessage {...messages.a11y_postedBy} />:
              </ScreenReaderOnly>
              {authorName}
            </AuthorNameContainer>

            {createdAt && (
              <TimeAgo>
                <FormattedRelative value={createdAt} />
              </TimeAgo>
            )}
          </AuthorMeta>
        </AuthorContainer>
      </Container>
    );
  }
}

const Data = adopt<DataProps, InputProps>({
  author: ({ authorId, render }) => <GetUser id={authorId}>{render}</GetUser>,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <Author {...inputProps} {...dataProps} />}
  </Data>
);
