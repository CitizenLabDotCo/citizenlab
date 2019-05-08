import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import clHistory from 'utils/cl-router/history';
import Link from 'utils/cl-router/Link';
import Avatar from 'components/Avatar';
import UserName from 'components/UI/UserName';
import Activities from './Activities/Activities';
import GetUser, { GetUserChildProps } from 'resources/GetUser';
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';
import { darken } from 'polished';
import { FormattedRelative } from 'react-intl';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

const Container = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 25px;
`;

const AuthorMeta = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 7px;
`;

const AuthorNameWrapper = styled.div`
  color: ${({ theme }) => theme.colorText};
  font-size: ${fontSizes.base}px;
  font-weight: 300;
  line-height: normal;
`;

const UserNameLink = styled(Link)`
  color: ${({ theme }) => theme.colorText};
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => darken(0.15, theme.colorText)};
    text-decoration: underline;
  }
`;

const TimeAgo = styled.div`
  color: ${colors.label};
  font-size: ${fontSizes.small}px;
  line-height: 17px;
  font-weight: 300;
  margin-top: 2px;
`;

interface InputProps {
  authorId: string | null;
  ideaCreatedAt: string;
  ideaId: string;
  showLabel?: boolean;
  className?: string;
}

interface DataProps {
  author: GetUserChildProps;
}

interface Props extends InputProps, DataProps {}

const IdeaAuthor = memo<Props>(({ ideaId, showLabel, ideaCreatedAt, authorId, author, className }) => {
  const goToUserProfile = () => {
    if (!isNilOrError(author)) {
      clHistory.push(`/profile/${author.attributes.slug}`);
    }
  };

  const noop = () => {};

  const showAuthorNameLabel = (showLabel || false);

  const userName = !isNilOrError(author) ? (
    <UserNameLink to={`/profile/${author.attributes.slug}`} className="e2e-author-link">
      <UserName user={author} />
    </UserNameLink>
  ) : (
    <UserName user={null} />
  );

  return (
    <Container className={className}>
      <Avatar
        userId={authorId}
        size="36px"
        onClick={authorId ? goToUserProfile : noop}
      />
      <AuthorMeta>
        <AuthorNameWrapper>
          {showAuthorNameLabel ? (
            <FormattedMessage {...messages.ideaPostedBy} values={{ userName }} />
          ) : userName}
        </AuthorNameWrapper>

        {ideaCreatedAt &&
          <TimeAgo>
            <FormattedRelative value={ideaCreatedAt} />
            <Activities ideaId={ideaId} />
          </TimeAgo>
        }
      </AuthorMeta>
    </Container>
  );
});

export default (inputProps: InputProps) => (
  <GetUser id={inputProps.authorId}>
    {author => <IdeaAuthor {...inputProps} author={author} />}
  </GetUser>
);
