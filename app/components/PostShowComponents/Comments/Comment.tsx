// libraries
import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';
import { get } from 'lodash-es';

// components
import CommentHeader from './CommentHeader';
import CommentBody from './CommentBody';
import CommentFooter from './CommentFooter';
import { Icon } from 'cl2-component-library';

// services
import { canModerateProject } from 'services/permissions/rules/projectPermissions';

// resources
import GetComment, { GetCommentChildProps } from 'resources/GetComment';
import GetUser, { GetUserChildProps } from 'resources/GetUser';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

const Container = styled.div``;

const ContainerInner = styled.div`
  position: relative;

  &.child {
    margin-top: 20px;
    margin-left: 38px;
  }
`;

const Content = styled.div`
  display: flex;
  margin-left: 39px;
`;

const BodyAndFooter = styled.div`
  flex: 1;
`;

const DeletedComment = styled.div`
  color: ${colors.label};
  display: flex;
  align-items: center;
  font-size: ${fontSizes.small}px;
  font-weight: 400;
  font-style: italic;
`;

const DeletedIcon = styled(Icon)`
  width: 18px;
  height: 18px;
  margin-right: 12px;
  fill: ${colors.label};
`;

interface InputProps {
  postId: string;
  postType: 'idea' | 'initiative';
  projectId?: string | null;
  commentId: string;
  commentType: 'parent' | 'child';
  hasChildComments?: boolean;
  last?: boolean;
  className?: string;
}

interface DataProps {
  comment: GetCommentChildProps;
  author: GetUserChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
  editing: boolean;
}

class Comment extends PureComponent<Props & InjectedIntlProps, State> {
  static defaultProps = {
    hasChildComment: false,
    last: false,
  };

  constructor(props) {
    super(props);
    this.state = {
      editing: false,
    };
  }

  onEditing = () => {
    this.setState({ editing: true });
  };

  onCancelEditing = () => {
    this.setState({ editing: false });
  };

  onCommentSaved = () => {
    this.setState({ editing: false });
  };

  render() {
    const {
      postId,
      postType,
      projectId,
      commentType,
      comment,
      author,
      hasChildComments,
      last,
      className,
    } = this.props;
    const { editing } = this.state;

    if (!isNilOrError(comment)) {
      const commentId = comment.id;
      const authorId = !isNilOrError(author) ? author.id : null;
      const lastComment =
        (commentType === 'parent' && !hasChildComments) ||
        (commentType === 'child' && last === true);
      const moderator =
        !isNilOrError(author) &&
        canModerateProject(projectId, { data: author });

      return (
        <Container
          id={commentId}
          className={`${className || ''} ${commentType} ${
            commentType === 'parent' ? 'e2e-parentcomment' : 'e2e-childcomment'
          } e2e-comment`}
        >
          <ContainerInner
            className={`${commentType} ${lastComment ? 'lastComment' : ''}`}
          >
            {comment.attributes.publication_status === 'published' && (
              <>
                <CommentHeader
                  projectId={projectId}
                  authorId={authorId}
                  commentId={commentId}
                  commentType={commentType}
                  commentCreatedAt={comment.attributes.created_at}
                  moderator={moderator}
                  className={commentType === 'parent' ? 'marginBottom' : ''}
                />

                <Content>
                  <BodyAndFooter>
                    <CommentBody
                      commentId={commentId}
                      commentType={commentType}
                      editing={editing}
                      onCommentSaved={this.onCommentSaved}
                      onCancelEditing={this.onCancelEditing}
                    />
                    <CommentFooter
                      className={commentType}
                      postId={postId}
                      postType={postType}
                      projectId={projectId}
                      commentId={commentId}
                      commentType={commentType}
                      onEditing={this.onEditing}
                    />
                  </BodyAndFooter>
                </Content>
              </>
            )}

            {comment.attributes.publication_status === 'deleted' && (
              <DeletedComment>
                <DeletedIcon name="delete" />
                <FormattedMessage {...messages.commentDeletedPlaceholder} />
              </DeletedComment>
            )}
          </ContainerInner>
        </Container>
      );
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  comment: ({ commentId, render }) => (
    <GetComment id={commentId}>{render}</GetComment>
  ),
  author: ({ comment, render }) => (
    <GetUser id={get(comment, 'relationships.author.data.id')}>
      {render}
    </GetUser>
  ),
});

const CommentWithHoCs = injectIntl<Props>(Comment);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <CommentWithHoCs {...inputProps} {...dataProps} />}
  </Data>
);
