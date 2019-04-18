import React, { PureComponent } from 'react';
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
  flex-direction: column;
  align-items: stretch;
`;

const TranslateButtonWrapper = styled.div``;

const TranslateButton = styled.button`
  padding: 0;
  color: ${colors.clBlue};
  text-decoration: underline;
  margin-top: 10px;

  &:hover {
    cursor: pointer;
  }
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 25px;
`;

const Left = styled.div`
  display: flex;
  align-items: center;
`;

const Separator = styled.div`
  font-size: ${fontSizes.small}px;
  margin-left: 5px;
  margin-right: 5px;

  ${media.phone`
    margin-left: 10px;
    margin-right: 10px;
  `}
`;

const ReplyButton = styled.button`
  color: ${colors.label};
  cursor: pointer;

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
  margin-left: 22px;

  ${media.smallerThanMinTablet`
    display: none;
  `}
`;

export interface ICommentReplyClicked {
  commentId: string;
  parentCommentId: string;
  authorFirstName: string;
  authorLastName: string;
  authorSlug: string;
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
    const { translateButtonClicked } = this.state;

    if (translateButtonClicked) {
      trackEventByName(tracks.clickGoBackToOriginalCommentButton);
    } else {
      trackEventByName(tracks.clickTranslateCommentButton);
    }

    this.setState(({ translateButtonClicked }) => ({ translateButtonClicked: !translateButtonClicked }));
  }

  onCommentEdit = () => {
    this.props.onEditing();
  }

  removeFocus = (event: React.MouseEvent) => {
    event.preventDefault();
  }

  onReply = () => {
    const { author, comment } = this.props;
    const commentId = get(comment, 'id', null);
    const parentCommentId = get(comment, 'relationships.parent.data.id', null);
    const authorFirstName = get(author, 'attributes.first_name', null);
    const authorLastName = get(author, 'attributes.last_name', null);
    const authorSlug = get(author, 'attributes.slug', null);

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
    const { commentType, projectId, commentId, className, comment, locale, idea, canReply } = this.props;
    const { translateButtonClicked } = this.state;

    if (!isNilOrError(idea) && !isNilOrError(comment) && !isNilOrError(locale)) {
      const commentBodyMultiloc = comment.attributes.body_multiloc;
      const showTranslateButton = commentBodyMultiloc && !commentBodyMultiloc[locale];
      const createdAt = comment.attributes.created_at;
      const commentingEnabled = (!isNilOrError(idea) ? get(idea.relationships.action_descriptor.data.commenting, 'enabled', false) : false);

      return (
        <Container className={className}>
          {/* <FeatureFlag name="machine_translations"> */}
            {showTranslateButton &&
              <TranslateButtonWrapper>
                <TranslateButton onClick={this.translateComment}>
                  {!translateButtonClicked
                    ? <FormattedMessage {...messages.translateComment} />
                    : <FormattedMessage {...messages.showOriginalComment} />
                  }
                </TranslateButton>
              </TranslateButtonWrapper>
            }
          {/* </FeatureFlag> */}

          <Footer>
            <Left>
              <CommentVote commentId={commentId} />
              {commentingEnabled && canReply &&
                <>
                  <Separator>•</Separator>
                  <ReplyButton onMouseDown={this.removeFocus} onClick={this.onReply}>
                    <FormattedMessage {...messages.commentReplyButton} />
                  </ReplyButton>
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
                <TimeAgo>
                  <FormattedRelative value={createdAt} />
                </TimeAgo>
              }
            </Right>
          </Footer>
        </Container>
      );
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  locale: <GetLocale />,
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
