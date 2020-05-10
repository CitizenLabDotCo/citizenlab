import React, { PureComponent } from 'react';
import { get } from 'lodash-es';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// components
import FeatureFlag from 'components/FeatureFlag';
import CommentVote from './CommentVote';
import CommentsMoreActions from './CommentsMoreActions';

// resources
import GetTenantLocales, { GetTenantLocalesChildProps } from 'resources/GetTenantLocales';
import GetComment, { GetCommentChildProps } from 'resources/GetComment';
import GetPost, { GetPostChildProps } from 'resources/GetPost';
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetUser, { GetUserChildProps } from 'resources/GetUser';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';

// events
import { commentReplyButtonClicked, commentTranslateButtonClicked } from './events';
import { openSignUpInModal } from 'components/SignUpIn/events';
import { openVerificationModal } from 'components/Verification/verificationModalEvents';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { media, colors, fontSizes } from 'utils/styleUtils';

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 22px;
`;

const Left = styled.div`
  display: flex;
  align-items: center;
`;

const Separator = styled.div`
  font-size: ${fontSizes.xs}px;
  line-height: 24px;
  margin-left: 11px;
  margin-right: 11px;

  ${media.smallerThanMinTablet`
    margin-left: 8px;
    margin-right: 8px;

    &.vote {
      display: none;
    }
  `}
`;

const ReplyButton = styled.button`
  color: ${colors.label};
  white-space: nowrap;
  cursor: pointer;
  padding: 0;
  margin: 0;
  border: none;

  &:hover {
    color: #000;
    text-decoration: underline;
  }
`;

const TranslateButton = styled.button`
  color: ${colors.label};
  white-space: nowrap;
  cursor: pointer;
  padding: 0;
  margin: 0;
  border: none;

  &:hover {
    color: #000;
    text-decoration: underline;
  }
`;

const Right = styled.div`
  display: flex;
  align-items: center;
  margin-left: 10px;
`;

const StyledCommentsMoreActions = styled(CommentsMoreActions)`
  margin-right: -6px;
`;

interface InputProps {
  postId: string;
  postType: 'idea' | 'initiative';
  projectId?: string | null;
  commentId: string;
  commentType: 'parent' | 'child';
  onEditing: () => void;
  canReply?: boolean;
  className?: string;
}

interface DataProps {
  tenantLocales: GetTenantLocalesChildProps;
  locale: GetLocaleChildProps;
  authUser: GetAuthUserChildProps;
  post: GetPostChildProps;
  comment: GetCommentChildProps;
  author: GetUserChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
  translateButtonClicked: boolean;
}

class CommentFooter extends PureComponent<Props & InjectedIntlProps, State> {
  static defaultProps = {
    canReply: true
  };

  constructor(props) {
    super(props);
    this.state = {
      translateButtonClicked: false,
    };
  }

  translateComment = () => {
    const { comment } = this.props;

    if (!isNilOrError(comment)) {
      const { translateButtonClicked } = this.state;
      const { clickGoBackToOriginalCommentButton, clickTranslateCommentButton } = tracks;
      const eventName = translateButtonClicked ? clickGoBackToOriginalCommentButton : clickTranslateCommentButton;
      trackEventByName(eventName);
      this.setState(({ translateButtonClicked }) => ({ translateButtonClicked: !translateButtonClicked }));
      commentTranslateButtonClicked(comment.id);
    }
  }

  onCommentEdit = () => {
    this.props.onEditing();
  }

  onReply = () => {
    const { post, comment } = this.props;

    console.log('zolg');

    if (!isNilOrError(post) && !isNilOrError(comment)) {
      const { authUser, author, commentType } = this.props;
      const { clickChildCommentReplyButton, clickParentCommentReplyButton } = tracks;
      const commentingDisabledReason = get(post, 'attributes.action_descriptor.commenting.disabled_reason');
      const authUserIsVerified = !isNilOrError(authUser) && authUser.attributes.verified;
      const commentId = !isNilOrError(comment) ? comment.id : null;
      const parentCommentId = !isNilOrError(comment) ? (comment.relationships.parent.data?.id || null) : null;
      const authorFirstName = !isNilOrError(author) ? author.attributes.first_name : null;
      const authorLastName = !isNilOrError(author) ? author.attributes.last_name : null;
      const authorSlug = !isNilOrError(author) ? author.attributes.slug : null;

      trackEventByName(commentType === 'child' ? clickChildCommentReplyButton : clickParentCommentReplyButton, {
        loggedIn: !!authUser
      });

      if (!isNilOrError(authUser) && !commentingDisabledReason) {
        commentReplyButtonClicked({
          commentId,
          parentCommentId,
          authorFirstName,
          authorLastName,
          authorSlug
        });
      } else if (!isNilOrError(authUser) && !authUserIsVerified && commentingDisabledReason === 'not_verified') {
        openVerificationModal();
      } else if (!authUser) {
        openSignUpInModal({
          verification: commentingDisabledReason === 'not_verified',
          action: () => this.onReply()
        });
      }
    }
  }

  render() {
    const { commentType, postId, postType, projectId, commentId, className, comment, tenantLocales, locale, post, canReply, intl: { formatMessage } } = this.props;
    const { translateButtonClicked } = this.state;

    if (!isNilOrError(post) && !isNilOrError(comment) && !isNilOrError(locale) && !isNilOrError(tenantLocales)) {
      const commentBodyMultiloc = comment.attributes.body_multiloc;
      const commentingDisabledReason = get(post, 'attributes.action_descriptor.commenting.disabled_reason');
      const commentingVotingDisabledReason = get(post, 'attributes.action_descriptor.comment_voting.disabled_reason');
      const upvoteCount = comment.attributes.upvotes_count;
      const showVoteComponent = commentingDisabledReason !== 'commenting_disabled' || upvoteCount > 0;
      const showReplyButton = canReply && commentingDisabledReason !== 'commenting_disabled';
      const showTranslateButton = !!(commentBodyMultiloc && !commentBodyMultiloc[locale] && tenantLocales.length > 1);

      return (
        <Container className={className}>
          <Left>
            {showVoteComponent &&
              <>
                <CommentVote
                  postId={postId}
                  postType={postType}
                  commentId={commentId}
                  commentType={commentType}
                  disabled={commentingVotingDisabledReason === 'commenting_disabled'}
                  commentingDisabledReason={commentingDisabledReason}
                />
                {/* // Make sure there's a next item before adding a separator */}
                {showReplyButton
                  ? <Separator className="vote">•</Separator>
                  : showTranslateButton ? <FeatureFlag name="machine_translations"><Separator>•</Separator></FeatureFlag> : null
                }
              </>
            }

            {showReplyButton &&
              <>
                <ReplyButton onClick={this.onReply} className="e2e-comment-reply-button">
                  <FormattedMessage {...messages.commentReplyButton} />
                </ReplyButton>
                {/* // Make sure there's a next item before adding a separator */}
                {showTranslateButton && <FeatureFlag name="machine_translations"><Separator>•</Separator></FeatureFlag>}
              </>
            }

            {showTranslateButton &&
              <FeatureFlag name="machine_translations">
                <TranslateButton onClick={this.translateComment}>
                  {!translateButtonClicked
                    ? <FormattedMessage {...messages.seeTranslation} />
                    : <FormattedMessage {...messages.seeOriginal} />
                  }
                </TranslateButton>
              </FeatureFlag>
            }
          </Left>

          <Right>
            <StyledCommentsMoreActions
              projectId={projectId}
              comment={comment}
              onCommentEdit={this.onCommentEdit}
              ariaLabel={formatMessage(messages.showMoreActions)}
            />
          </Right>
        </Container>
      );
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  tenantLocales: <GetTenantLocales />,
  locale: <GetLocale />,
  authUser: <GetAuthUser />,
  post: ({ postId, postType, render }) => <GetPost id={postId} type={postType}>{render}</GetPost>,
  comment: ({ commentId, render }) => <GetComment id={commentId}>{render}</GetComment>,
  author: ({ comment, render }) => <GetUser id={get(comment, 'relationships.author.data.id')}>{render}</GetUser>
});

const CommentFooterWithHoCs = injectIntl<Props>(CommentFooter);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <CommentFooterWithHoCs {...inputProps} {...dataProps} />}
  </Data>
);
