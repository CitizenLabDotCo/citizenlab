import React, { memo } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';
import clHistory from 'utils/cl-router/history';

// components
import Avatar from 'components/Avatar';
import ContentChangeLog from 'components/PostShowComponents/ContentChangeLog';
import IdeaPostedBy from './IdeaPostedBy';

// resources
import GetUser, { GetUserChildProps } from 'resources/GetUser';

// styling
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';

// i18n
import { FormattedRelative } from 'react-intl';

const Container = styled.div`
  display: flex;
  align-items: center;
`;

const AuthorMeta = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 7px;
`;

const TimeAgo = styled.div`
  color: ${colors.label};
  font-size: ${fontSizes.small}px;
  line-height: 17px;
  font-weight: 300;
  display: flex;
  align-items: center;
  margin-top: 2px;
`;

interface InputProps {
  authorId: string | null;
  ideaPublishedAt: string;
  ideaId: string;
  className?: string;
}

interface DataProps {
  author: GetUserChildProps;
}

interface Props extends InputProps, DataProps {}

const IdeaAuthor = memo<Props>(
  ({ ideaId, ideaPublishedAt, authorId, author, className }) => {
    const goToUserProfile = () => {
      if (!isNilOrError(author)) {
        clHistory.push(`/profile/${author.attributes.slug}`);
      }
    };

    const noop = () => {};

    return (
      <Container className={`e2e-idea-author ${className}`}>
        <Avatar
          userId={authorId}
          size="36px"
          onClick={authorId ? goToUserProfile : noop}
        />
        <AuthorMeta>
          <IdeaPostedBy authorId={authorId} />

          {ideaPublishedAt && (
            <TimeAgo>
              <FormattedRelative value={ideaPublishedAt} />
              <ContentChangeLog postId={ideaId} postType="idea" />
            </TimeAgo>
          )}
        </AuthorMeta>
      </Container>
    );
  }
);

const Data = adopt<DataProps, InputProps>({
  author: ({ authorId, render }) => <GetUser id={authorId}>{render}</GetUser>,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <IdeaAuthor {...inputProps} {...dataProps} />}
  </Data>
);
