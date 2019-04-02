import React, { PureComponent } from 'react';
import { get } from 'lodash-es';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// components
import Comment from './Comment';
import ChildCommentForm from './ChildCommentForm';
import clHistory from 'utils/cl-router/history';
import Icon from 'components/UI/Icon';

// services
import { updateComment, IUpdatedComment } from 'services/comments';

// resources
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetComment, { GetCommentChildProps } from 'resources/GetComment';
import GetComments, { GetCommentsChildProps } from 'resources/GetComments';
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../messages';

// style
import styled from 'styled-components';
import { CLErrorsJSON } from 'typings';

// typings
import { FormikActions } from 'formik';

const Container = styled.div`
  margin-top: 38px;
  position: relative;
  border-radius: 3px;
  border: 1px solid #ebebeb;
  box-sizing: border-box;
  box-shadow: 1px 1px 10px rgba(0, 0, 0, 0.05);
  background: #fff;
`;

const ParentCommentContainer = styled.div`
  position: relative;

  &.deleted {
    align-items: center;
    display: flex;
    font-style: italic;
    font-weight: 500;
  }
`;

const DeletedIcon = styled(Icon)`
  height: 1em;
  margin-right: 1rem;
  width: 1em;
`;

interface InputProps {
  ideaId: string;
  commentId: string;
}

interface DataProps {
  authUser: GetAuthUserChildProps;
  comment: GetCommentChildProps;
  childComments: GetCommentsChildProps;
  idea: GetIdeaChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
  showForm: boolean;
  spamModalVisible: boolean;
  editionMode: boolean;
  translateButtonClicked: boolean;
}

class ParentComment extends PureComponent<Props & InjectedIntlProps, State> {
  constructor(props) {
    super(props);
    this.state = {
      showForm: false,
      spamModalVisible: false,
      editionMode: false,
      translateButtonClicked: false,
    };
  }

  toggleForm = () => {
    trackEventByName(tracks.clickReply);
    this.setState({ showForm: true });
  }

  captureClick = (event) => {
    if (event.target.classList.contains('mention')) {
      event.preventDefault();
      const link = event.target.getAttribute('data-link');
      clHistory.push(link);
    }
  }

  onCommentEdit = () => {
    this.setState({ editionMode: true });
  }

  onCancelEdition = () => {
    this.setState({ editionMode: false });
  }

  onCommentSave = async (comment: IUpdatedComment, formikActions: FormikActions<IUpdatedComment>) => {
    const { setSubmitting, setErrors } = formikActions;

    try {
      await updateComment(this.props.commentId, comment);
      this.setState({ editionMode: false });
    } catch (error) {
      if (error && error.json) {
        const apiErrors = (error as CLErrorsJSON).json.errors;
        setErrors(apiErrors);
        setSubmitting(false);
      }
    }
  }

  translateComment = () => {
    const { translateButtonClicked } = this.state;

    if (translateButtonClicked) {
      trackEventByName(tracks.clickGoBackToOriginalCommentButton);
    } else {
      trackEventByName(tracks.clickTranslateCommentButton);
    }

    this.setState(prevState => ({
      translateButtonClicked: !prevState.translateButtonClicked,
    }));
  }

  render() {
    const { commentId, authUser, comment, childComments, idea } = this.props;

    if (!isNilOrError(comment) && !isNilOrError(idea)) {
      const ideaId = comment.relationships.idea.data.id;
      const commentDeleted = (comment.attributes.publication_status === 'deleted');
      const commentingEnabled = idea.relationships.action_descriptor.data.commenting.enabled;
      const showCommentForm = (authUser && commentingEnabled && !commentDeleted);
      const childCommentIds = (!isNilOrError(childComments) && childComments.filter((comment) => {
        if (!comment.relationships.parent.data) return false;
        if (comment.attributes.publication_status === 'deleted') return false;
        if (comment.relationships.parent.data.id === commentId) return true;
        return false;
      }).map(comment => comment.id));
      const hasChildComments = (childCommentIds && childCommentIds.length > 0);

      // hide parent comments that are deleted when they have no children
      if (comment.attributes.publication_status === 'deleted' && (!childCommentIds || childCommentIds.length === 0)) {
        return null;
      }

      return (
        <Container className="e2e-comment-thread">
          <ParentCommentContainer className={`${commentDeleted && 'deleted'}`}>
            {comment.attributes.publication_status === 'published' &&
              <Comment
                commentId={comment.id}
                commentType="parent"
                hasChildComments={hasChildComments}
              />
            }

            {commentDeleted &&
              <>
                <DeletedIcon name="delete" />
                <FormattedMessage {...messages.commentDeletedPlaceholder} />
              </>
            }
          </ParentCommentContainer>

          {childCommentIds && childCommentIds.length > 0 && childCommentIds.map((childCommentId, index) => (
            <Comment
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
  childComments: ({ ideaId, render }) => <GetComments ideaId={ideaId}>{render}</GetComments>,
  idea: ({ comment, render }) => <GetIdea id={get(comment, 'relationships.idea.data.id')}>{render}</GetIdea>
});

const ParentCommentWithHoCs = injectIntl<Props>(ParentComment);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <ParentCommentWithHoCs {...inputProps} {...dataProps} />}
  </Data>
);
