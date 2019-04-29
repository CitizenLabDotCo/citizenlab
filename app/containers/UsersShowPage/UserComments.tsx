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
import T from 'components/T';
import IdeaCommentGroup from './IdeaCommentGroup';
import CommentHeader from 'containers/IdeasShow/Comments/CommentHeader';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin: auto;

  max-width: 760px;
`;

interface InputProps {
  userId: string;
}

interface DataProps {
  comments: GetCommentsForUserChildProps;
}

interface Props extends InputProps, DataProps {}

export const reducer = (acc: ICommentData[][], current: ICommentData) => {
  const accLen = acc.length;
  const lastArray = acc[accLen - 1];

  if (lastArray.length === 0) {
    return [[current]];
  }

  if (current.relationships.idea.data.id === lastArray[lastArray.length - 1].relationships.idea.data.id) {
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

      return (
        <Container>
          {comments.reduce(reducer, [[]]).map(commentForIdea => (
            <IdeaCommentGroup
              key={commentForIdea[0].relationships.idea.data.id}
              ideaId={commentForIdea[0].relationships.idea.data.id}
              commentsForIdea={commentForIdea}
            />
          ))}
          </Container>
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
