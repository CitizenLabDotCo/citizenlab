import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import clHistory from 'utils/cl-router/history';

import Link from 'utils/cl-router/Link';
import Avatar from 'components/Avatar';
import UserName from 'components/UI/UserName';
import Activities from './Activities/Activities';

import GetUser, { GetUserChildProps } from 'resources/GetUser';

import styled from 'styled-components';
import { fontSizes, media, colors } from 'utils/styleUtils';
import { darken } from 'polished';

import { FormattedMessage } from 'utils/cl-intl';
import { FormattedRelative } from 'react-intl';
import messages from './messages';

const Container = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 25px;
`;

const AuthorMeta = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 8px;
`;

const AuthorNameWrapper = styled.div`
  color: #333;
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  line-height: 20px;

  ${media.smallerThanMaxTablet`
    font-size: ${fontSizes.small}px;
    line-height: 18px;
  `}
`;

const AuthorName = styled(Link)`
  color: ${({ theme }) => theme.colorText};
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

  ${media.smallerThanMaxTablet`
    margin-top: 0px;
  `}
`;

interface DataProps {
  author: GetUserChildProps;
}

interface InputProps {
  authorId: string | null;
  ideaCreatedAt: string;
  ideaId: string;
}

interface Props extends InputProps, DataProps {}

const IdeaAuthor = React.memo<Props>((props: Props) => {

  const goToUserProfile = () => {
    const { author } = props;

    if (!isNilOrError(author)) {
      clHistory.push(`/profile/${author.attributes.slug}`);
    }
  };

  const noop = () => {};

  const { ideaId, ideaCreatedAt, authorId, author } = props;

  return (
    <Container>
      <Avatar
        userId={authorId}
        size="40px"
        onClick={authorId ? goToUserProfile : noop}
      />
      <AuthorMeta>
        <AuthorNameWrapper>
          <FormattedMessage
            {...messages.byAuthorName}
            values={{
              authorName: (
                <AuthorName className="e2e-author-link" to={!isNilOrError(author) ? `/profile/${author.attributes.slug}` : ''}>
                  <UserName user={!isNilOrError(author) ? author : null} />
                </AuthorName>
              )
            }}
          />
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
