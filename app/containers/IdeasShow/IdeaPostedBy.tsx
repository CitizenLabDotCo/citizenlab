import React, { memo } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// components
import Link from 'utils/cl-router/Link';
import UserName from 'components/UI/UserName';

// resources
import GetUser, { GetUserChildProps } from 'resources/GetUser';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// styling
import styled from 'styled-components';
import { darken } from 'polished';
import { fontSizes, media } from 'utils/styleUtils';

const Container = styled.div`
  color: ${({ theme }) => theme.colorText};
  font-size: ${fontSizes.base}px;
  font-weight: 300;
  line-height: normal;

  ${media.smallerThanMaxTablet`
    font-size: ${fontSizes.small}px;
  `}
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

interface InputProps {
  authorId: string | null;
  className?: string;
}

interface DataProps {
  author: GetUserChildProps;
}

interface Props extends InputProps, DataProps {}

const IdeaPostedBy = memo<Props>(({ author, className }) => {

  const userName = !isNilOrError(author) ? (
    <UserNameLink to={`/profile/${author.attributes.slug}`} className="e2e-idea-author-link">
      <UserName user={author} />
    </UserNameLink>
  ) : (
    <UserName user={null} />
  );

  return (
    <Container className={className}>
      <FormattedMessage {...messages.ideaPostedBy} values={{ userName }} />
    </Container>
  );
});

const Data = adopt<DataProps, InputProps>({
  author: ({ authorId, render }) => <GetUser id={authorId}>{render}</GetUser>
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <IdeaPostedBy {...inputProps} {...dataProps} />}
  </Data>
);
