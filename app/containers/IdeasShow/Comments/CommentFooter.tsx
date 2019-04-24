import React, { PureComponent, MouseEvent } from 'react';
import { get } from 'lodash-es';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// components
// import FeatureFlag from 'components/FeatureFlag';
import CommentVote from './CommentVote';
import CommentsMoreActions from './CommentsMoreActions';

// services
import eventEmitter from 'utils/eventEmitter';

// resources
import GetComment, { GetCommentChildProps } from 'resources/GetComment';
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetUser, { GetUserChildProps } from 'resources/GetUser';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { FormattedRelative, InjectedIntlProps } from 'react-intl';
import messages from '../messages';

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
  margin-left: 10px;
  margin-right: 10px;
`;

const ReplyButton = styled.button`
  color: ${colors.label};
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
`;

const StyledCommentsMoreActions = styled(CommentsMoreActions)`
  margin-left: 14px;
  margin-right: -6px;
`;

const TimeAgo = styled.div`
  color: ${colors.label};
  font-size: ${fontSizes.small}px;
  line-height: normal;
  font-weight: 400;

  &.hasLeftMargin {
    margin-left: 22px;
  }

  ${media.smallerThanMinTablet`
    display: none;
  `}
`;

export interface ICommentReplyClicked {
  commentId: string | null;
  parentCommentId: string | null;
  authorFirstName: string | null;
  authorLastName: string | null;
  authorSlug: string | null;
}

interface InputProps {
  ideaId: string;
  projectId: string;
  commentId: string;
  commentType: 'parent' | 'child';
  onEditing: () => void;
  canReply?: boolean;
  className?: string;
}

interface DataProps {
  locale: GetLocaleChildProps;
  authUser: GetAuthUserChildProps;
  idea: GetIdeaChildProps;
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
    const { author, comment } = this.props;
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
  }

  moreActionsAriaLabel = this.props.intl.formatMessage(messages.showMoreActions);

  render() {
    const { commentType, ideaId, projectId, commentId, className, comment, locale, authUser, idea, canReply } = this.props;
    const { translateButtonClicked } = this.state;

    if (!isNilOrError(idea) && !isNilOrError(comment) && !isNilOrError(locale)) {
      const commentBodyMultiloc = comment.attributes.body_multiloc;
      const showTranslateButton = commentBodyMultiloc && !commentBodyMultiloc[locale];
      const createdAt = comment.attributes.created_at;
      const commentingEnabled = (!isNilOrError(idea) ? get(idea.relationships.action_descriptor.data.commenting, 'enabled', false) : false);

      return (
        <Container className={className}>
          <Left>
            <CommentVote
              ideaId={ideaId}
              commentId={commentId}
            />

            {authUser && commentingEnabled && canReply &&
              <>
                <Separator>•</Separator>
                <ReplyButton onMouseDown={this.removeFocus} onClick={this.onReply}>
                  <FormattedMessage {...messages.commentReplyButton} />
                </ReplyButton>
                {/* <FeatureFlag name="machine_translations"> */}
                  {showTranslateButton &&
                    <>
                      <Separator>•</Separator>
                      <TranslateButton onMouseDown={this.removeFocus} onClick={this.translateComment}>
                        {!translateButtonClicked
                          ? <FormattedMessage {...messages.seeTranslation} />
                          : <FormattedMessage {...messages.seeOriginal} />
                        }
                      </TranslateButton>
                    </>
                  }
                {/* </FeatureFlag> */}
              </>
            }
          </Left>

          <Right>
            <StyledCommentsMoreActions
              projectId={projectId}
              comment={comment}
              onCommentEdit={this.onCommentEdit}
              ariaLabel={this.moreActionsAriaLabel}
            />

            {commentType === 'child' &&
              <TimeAgo className={authUser ? 'hasLeftMargin' : ''}>
                <FormattedRelative value={createdAt} />
              </TimeAgo>
            }
          </Right>
        </Container>
      );
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  locale: <GetLocale />,
  authUser: <GetAuthUser />,
  idea: ({ ideaId, render }) => <GetIdea id={ideaId}>{render}</GetIdea>,
  comment: ({ commentId, render }) => <GetComment id={commentId}>{render}</GetComment>,
  author: ({ comment, render }) => <GetUser id={get(comment, 'relationships.author.data.id')}>{render}</GetUser>
});

const CommentFooterWithHoCs = injectIntl<Props>(CommentFooter);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <CommentFooterWithHoCs {...inputProps} {...dataProps} />}
  </Data>
);
