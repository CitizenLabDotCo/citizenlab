import React, { PureComponent, MouseEvent } from 'react';
import { get } from 'lodash-es';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';
import clHistory from 'utils/cl-router/history';

// components
import FeatureFlag from 'components/FeatureFlag';
import CommentVote from './CommentVote';
import CommentsMoreActions from './CommentsMoreActions';

// services
import eventEmitter from 'utils/eventEmitter';

// resources
import GetTenantLocales, { GetTenantLocalesChildProps } from 'resources/GetTenantLocales';
import GetComment, { GetCommentChildProps } from 'resources/GetComment';
import GetPost, { GetPostChildProps } from 'resources/GetPost';
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetUser, { GetUserChildProps } from 'resources/GetUser';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';

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
  margin-left: 10px;
  margin-right: 10px;

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

export interface ICommentReplyClicked {
  commentId: string | null;
  parentCommentId: string | null;
  authorFirstName: string | null;
  authorLastName: string | null;
  authorSlug: string | null;
}

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
    const { translateButtonClicked } = this.state;

    if (!isNilOrError(comment)) {
      if (translateButtonClicked) {
        trackEventByName(tracks.clickGoBackToOriginalCommentButton);
      } else {
        trackEventByName(tracks.clickTranslateCommentButton);
      }

      this.setState(({ translateButtonClicked }) => ({ translateButtonClicked: !translateButtonClicked }));

      eventEmitter.emit<string>('CommentFooter', 'commentTranslateButtonClicked', comment.id);
    }
  }

  onCommentEdit = () => {
    this.props.onEditing();
  }

  removeFocus = (event: MouseEvent) => {
    event.preventDefault();
  }

  onReply = () => {
    const { authUser, author, comment, commentType } = this.props;

    if (commentType === 'child') {
      trackEventByName(tracks.clickChildCommentReplyButton, {
        loggedIn: !!authUser
      });
    } else if (commentType === 'parent') {
      trackEventByName(tracks.clickParentCommentReplyButton, {
        loggedIn: !!authUser
      });
    }

    if (!isNilOrError(authUser)) {
      const commentId: string | null = get(comment, 'id', null);
      const parentCommentId: string | null = get(comment, 'relationships.parent.data.id', null);
      const authorFirstName: string | null = get(author, 'attributes.first_name', null);
      const authorLastName: string | null = get(author, 'attributes.last_name', null);
      const authorSlug: string | null = get(author, 'attributes.slug', null);
      const eventValue: ICommentReplyClicked = {
        commentId,
        parentCommentId,
        authorFirstName,
        authorLastName,
        authorSlug
      };

      eventEmitter.emit<ICommentReplyClicked>('CommentFooter', 'commentReplyButtonClicked', eventValue);
    } else {
      clHistory.push('/sign-in');
    }
  }

  moreActionsAriaLabel = this.props.intl.formatMessage(messages.showMoreActions);

  render() {
    const { commentType, postId, postType, projectId, commentId, className, comment, tenantLocales, locale, authUser, post, canReply } = this.props;
    const { translateButtonClicked } = this.state;

    if (!isNilOrError(post) && !isNilOrError(comment) && !isNilOrError(locale) && !isNilOrError(tenantLocales)) {
      const commentBodyMultiloc = comment.attributes.body_multiloc;
      const commentingEnabled = get(post, 'attributes.action_descriptor.commenting.enabled', true);
      const commentVotingEnabled = get(post, 'attributes.action_descriptor.comment_voting.enabled', true);
      const upvoteCount = comment.attributes.upvotes_count;
      const showVoteComponent = (commentVotingEnabled || (!commentVotingEnabled && upvoteCount > 0));
      const showReplyButton = !!(commentingEnabled && canReply);
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
                  votingEnabled={commentVotingEnabled}
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
                <ReplyButton onMouseDown={this.removeFocus} onClick={this.onReply} className="e2e-comment-reply-button">
                  <FormattedMessage {...messages.commentReplyButton} />
                </ReplyButton>
                {/* // Make sure there's a next item before adding a separator */}
                {showTranslateButton && <FeatureFlag name="machine_translations"><Separator>•</Separator></FeatureFlag>}
              </>
            }

            {showTranslateButton &&
              <FeatureFlag name="machine_translations">
                <TranslateButton onMouseDown={this.removeFocus} onClick={this.translateComment}>
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
              ariaLabel={this.moreActionsAriaLabel}
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
