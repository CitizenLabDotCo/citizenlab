import React, { PureComponent } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { withRouter, WithRouterProps } from 'react-router';

// components
import IdeaCards from 'components/IdeaCards';
import ContentContainer from 'components/ContentContainer';
import Footer from 'components/Footer';
import UsersShowPageMeta from './UsersShowPageMeta';

// resources
import GetCommentsForUser, { GetCommentsForUserChildProps } from 'resources/GetCommentsForUser';
import { ICommentData } from 'services/comments';

// style
import styled from 'styled-components';
import { media, colors } from 'utils/styleUtils';
import UserHeader from './UserHeader';
import UserNavbar from './UserNavbar';
import { Link } from 'utils/cl-router/Link';

const Container = styled.div`
  display: flex;
  flex-direction: column;

  max-width: 760px;
`;

const IdeaCommentGroup = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px 40px;
  &:not(:last-child) {
    margin-bottom: 20px;
  }
`;

const IdeaLink = styled(Link)`
  background: ${colors.adminBackground};
`;

interface InputProps {
  userId: string;
}

interface DataProps {
  comments: GetCommentsForUserChildProps;
}

interface Props extends InputProps, DataProps {}

const reducer = (acc: ICommentData[][], current: ICommentData) => {
  const accLen = acc.length;
  const lastArray = acc[accLen];

  if (current.relationships.idea.data.id === lastArray[lastArray.length].relationships.idea.data.id) {
    lastArray.push(current);
    return acc;
  } else {
    acc.push([current]);
    return acc;
  }
};

export class UsersComments extends PureComponent<Props> {
  render() {
    const { comments } = this.props;

    if (!isNilOrError(comments) && comments.length > 0) {
      console.log(comments);

      comments.reduce((newArr));
      return comments.map(comment =>
        <span>{comment.attributes.body_multiloc}</span>
      );
    }

    return null;
  }
}

export default withRouter((inputProps: InputProps & WithRouterProps) => (
  <GetCommentsForUser userId={inputProps.userId}>
    {comments => <UsersComments comments={comments} {...inputProps} />}
  </GetCommentsForUser>
));
