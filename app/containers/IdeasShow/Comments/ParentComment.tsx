import React, { PureComponent } from 'react';
import { get } from 'lodash-es';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';
import { Subscription } from 'rxjs';

// components
import Comment from './Comment';
import ChildCommentForm from './ChildCommentForm';

// services
import { childCommentsStream } from 'services/comments';

// resources
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetComment, { GetCommentChildProps } from 'resources/GetComment';
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// style
import styled from 'styled-components';

const Container = styled.div`
  margin-top: 30px;
  position: relative;
  background: #fff;
  box-sizing: border-box;
  border: 1px solid #ebebeb;
  box-shadow: 1px 1px 10px rgba(0, 0, 0, 0.05);
  border-radius: 3px;
`;

const ParentCommentContainer = styled.div`
  position: relative;
`;

interface InputProps {
  ideaId: string;
  commentId: string;
  childCommentIds: string[] | false;
}

interface DataProps {
  authUser: GetAuthUserChildProps;
  comment: GetCommentChildProps;
  idea: GetIdeaChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

class ParentComment extends PureComponent<Props & InjectedIntlProps, State> {
  subscriptions: Subscription[];

  componentDidMount() {
    this.subscriptions = [
      childCommentsStream(this.props.commentId).observable.subscribe((childComments) => {
        console.log('childComments for ' + this.props.commentId);
        console.log(childComments);
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { commentId, authUser, comment, childCommentIds, idea } = this.props;

    if (!isNilOrError(comment) && !isNilOrError(idea)) {
      const ideaId = comment.relationships.idea.data.id;
      const commentDeleted = (comment.attributes.publication_status === 'deleted');
      const commentingEnabled = idea.relationships.action_descriptor.data.commenting.enabled;
      const showCommentForm = (authUser && commentingEnabled && !commentDeleted);
      const hasChildComments = (childCommentIds && childCommentIds.length > 0);

      // hide parent comments that are deleted when they have no children
      if (comment.attributes.publication_status === 'deleted' && !hasChildComments) {
        return null;
      }

      console.log(comment);

      return (
        <Container className="e2e-comment-thread">
          <ParentCommentContainer className={`${commentDeleted && 'deleted'}`}>
            <Comment
              ideaId={idea.id}
              projectId={idea.relationships.project.data.id}
              commentId={comment.id}
              commentType="parent"
              hasChildComments={hasChildComments}
            />
          </ParentCommentContainer>

          {childCommentIds && childCommentIds.length > 0 && childCommentIds.map((childCommentId, index) => (
            <Comment
              ideaId={idea.id}
              projectId={idea.relationships.project.data.id}
              key={childCommentId}
              commentId={childCommentId}
              commentType="child"
              last={index === childCommentIds.length - 1}
            />
          ))}

          {showCommentForm &&
            <ChildCommentForm ideaId={ideaId} parentId={commentId} />
          }
        </Container>
      );
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  authUser: <GetAuthUser/>,
  comment: ({ commentId, render }) => <GetComment id={commentId}>{render}</GetComment>,
  idea: ({ comment, render }) => <GetIdea id={get(comment, 'relationships.idea.data.id')}>{render}</GetIdea>
});

const ParentCommentWithHoCs = injectIntl<Props>(ParentComment);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <ParentCommentWithHoCs {...inputProps} {...dataProps} />}
  </Data>
);
