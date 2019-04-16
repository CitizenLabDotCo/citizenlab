import React, { PureComponent } from 'react';
import { get } from 'lodash-es';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// components
import Comment from './Comment';
import ChildCommentForm from './ChildCommentForm';
import clHistory from 'utils/cl-router/history';

// resources
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetComment, { GetCommentChildProps } from 'resources/GetComment';
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// style
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

const Container = styled.div`
  margin-top: 30px;
  position: relative;
  background: #fff;
  border: 1px solid #ebebeb;
  box-sizing: border-box;
  box-shadow: 1px 1px 10px rgba(0, 0, 0, 0.05);
  border-radius: 3px;

  ${media.smallerThanMinTablet`
    border-radius: 0px;
  `}
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
    const { commentId, authUser, comment, childCommentIds, idea } = this.props;

    console.log('comment');
    console.log(comment);

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

      return (
        <Container className="e2e-comment-thread">
          <ParentCommentContainer className={`${commentDeleted && 'deleted'}`}>
            <Comment
              commentId={comment.id}
              commentType="parent"
              hasChildComments={hasChildComments}
            />
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
  idea: ({ comment, render }) => <GetIdea id={get(comment, 'relationships.idea.data.id')}>{render}</GetIdea>
});

const ParentCommentWithHoCs = injectIntl<Props>(ParentComment);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <ParentCommentWithHoCs {...inputProps} {...dataProps} />}
  </Data>
);
