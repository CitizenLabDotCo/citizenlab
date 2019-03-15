import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import clHistory from 'utils/cl-router/history';

import Link from 'utils/cl-router/Link';
import Avatar from 'components/Avatar';
import UserName from 'components/UI/UserName';
import Activities from './Activities';

import GetUser, { GetUserChildProps } from 'resources/GetUser';

import styled from 'styled-components';
import { fontSizes, media, colors } from 'utils/styleUtils';
import { darken } from 'polished';

import { FormattedMessage } from 'utils/cl-intl';
import { FormattedRelative } from 'react-intl';
import messages from './messages';

const AuthorContainer = styled.div`
  display: flex;
  align-items: center;
  margin: 0;
  padding: 0;
`;

const AuthorAndAdressWrapper = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: space-between;
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
  color: ${colors.clBlueDark};
  text-decoration: none;
  cursor: pointer;

  &:hover {
    color: ${darken(0.15, colors.clBlueDark)};
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

const IdeaAuthor = (props: Props) => {

  const goToUserProfile = () => {
    const { author } = props;

    if (!isNilOrError(author)) {
      clHistory.push(`/profile/${author.attributes.slug}`);
    }
  };
  const { ideaId, ideaCreatedAt, authorId, author } = props;
  return (
    <AuthorAndAdressWrapper>
      <AuthorContainer>
        <Avatar
          userId={authorId}
          size="40px"
          onClick={authorId ? goToUserProfile : () => { }}
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
      </AuthorContainer>
    </AuthorAndAdressWrapper>
  );
};

export default (inputProps: InputProps) => (
  <GetUser id={inputProps.authorId}>
    {author => <IdeaAuthor {...inputProps} author={author} />}
  </GetUser>
);
