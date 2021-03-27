import React, { PureComponent } from 'react';
import { get } from 'lodash-es';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// components
import CommentVote from './CommentVote';
import CommentReplyButton from './CommentReplyButton';
import CommentTranslateButton from './CommentTranslateButton';
import CommentsMoreActions from './CommentsMoreActions';

// resources
import GetAppConfigurationLocales, {
  GetAppConfigurationLocalesChildProps,
} from 'resources/GetAppConfigurationLocales';
import GetComment, { GetCommentChildProps } from 'resources/GetComment';
import GetPost, { GetPostChildProps } from 'resources/GetPost';
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetUser, { GetUserChildProps } from 'resources/GetUser';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetInitiativesPermissions, {
  GetInitiativesPermissionsChildProps,
} from 'resources/GetInitiativesPermissions';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { colors, fontSizes, isRtl } from 'utils/styleUtils';

const footerHeight = '30px';
const footerTopMargin = '6px';

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  ${isRtl`
    flex-direction: row-reverse;
  `}
`;

const Left = styled.ul`
  display: flex;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0;

  ${isRtl`
    flex-direction: row-reverse;
  `}

  & li {
    margin-right: 12px;

    &:after {
      color: ${colors.label};
      font-size: ${fontSizes.small}px;
      font-weight: 400;
      content: '•';
      margin-left: 12px;
    }

    ${isRtl`
        margin-left: 0;
        margin-right: 12px;

        &:after {
          content: '';
        }

        &:before {
          color: ${colors.label};
          font-size: ${fontSizes.small}px;
          font-weight: 400;
          content: '•';
          margin-right: 12px;
        }
    `}

    &:last-child {
      &:after,
      &:before {
        margin-left: 0px;
        margin-right: 0px;
        content: '';
      }
    }
  }
`;

const StyledCommentVote = styled(CommentVote)`
  height: ${footerHeight};
  margin-top: ${footerTopMargin};
`;

const StyledCommentReplyButton = styled(CommentReplyButton)`
  height: ${footerHeight};
  margin-top: ${footerTopMargin};
`;

const StyledCommentTranslateButton = styled(CommentTranslateButton)`
  height: ${footerHeight};
  margin-top: ${footerTopMargin};
`;

const StyledCommentsMoreActions = styled(CommentsMoreActions)`
  height: ${footerHeight};
  margin-top: ${footerTopMargin};
`;

const Right = styled.div`
  display: flex;
  align-items: center;
`;

interface InputProps {
  postId: string;
  postType: 'idea' | 'initiative';
  projectId?: string | null;
  commentId: string;
  commentType: 'parent' | 'child';
  onEditing: () => void;
  className?: string;
}

interface DataProps {
  tenantLocales: GetAppConfigurationLocalesChildProps;
  locale: GetLocaleChildProps;
  authUser: GetAuthUserChildProps;
  post: GetPostChildProps;
  comment: GetCommentChildProps;
  author: GetUserChildProps;
  commentingPermissionInitiative: GetInitiativesPermissionsChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

class CommentFooter extends PureComponent<Props & InjectedIntlProps, State> {
  onCommentEdit = () => {
    this.props.onEditing();
  };

  render() {
    const {
      authUser,
      author,
      commentType,
      postId,
      postType,
      projectId,
      commentId,
      className,
      comment,
      tenantLocales,
      locale,
      post,
      intl: { formatMessage },
      commentingPermissionInitiative,
    } = this.props;
    if (
      !isNilOrError(post) &&
      !isNilOrError(comment) &&
      !isNilOrError(locale) &&
      !isNilOrError(tenantLocales)
    ) {
      return (
        <Container className={className || ''}>
          <Left>
            <StyledCommentVote
              postId={postId}
              postType={postType}
              commentId={commentId}
              commentType={commentType}
            />
            <StyledCommentReplyButton
              postId={postId}
              postType={postType}
              commentId={commentId}
              commentType={commentType}
              authUser={authUser}
              author={author}
              post={post}
              comment={comment}
              commentingPermissionInitiative={commentingPermissionInitiative}
            />
            <StyledCommentTranslateButton
              comment={comment}
              locale={locale}
              tenantLocales={tenantLocales}
            />
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
  tenantLocales: <GetAppConfigurationLocales />,
  locale: <GetLocale />,
  authUser: <GetAuthUser />,
  post: ({ postId, postType, render }) => (
    <GetPost id={postId} type={postType}>
      {render}
    </GetPost>
  ),
  comment: ({ commentId, render }) => (
    <GetComment id={commentId}>{render}</GetComment>
  ),
  author: ({ comment, render }) => (
    <GetUser id={get(comment, 'relationships.author.data.id')}>
      {render}
    </GetUser>
  ),
  commentingPermissionInitiative: (
    <GetInitiativesPermissions action="commenting_initiative" />
  ),
});

const CommentFooterWithHoCs = injectIntl<Props>(CommentFooter);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <CommentFooterWithHoCs {...inputProps} {...dataProps} />}
  </Data>
);
