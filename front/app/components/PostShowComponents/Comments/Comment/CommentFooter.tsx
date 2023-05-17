import React from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// components
import CommentVote from './CommentVote';
import CommentReplyButton from './CommentReplyButton';
import CommentsMoreActions from './CommentsMoreActions';

// resources
import GetAppConfigurationLocales, {
  GetAppConfigurationLocalesChildProps,
} from 'resources/GetAppConfigurationLocales';
import GetComment, { GetCommentChildProps } from 'resources/GetComment';
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetInitiativesPermissions, {
  GetInitiativesPermissionsChildProps,
} from 'resources/GetInitiativesPermissions';

// style
import styled from 'styled-components';
import { colors, fontSizes, isRtl } from 'utils/styleUtils';
import Outlet from 'components/Outlet';

// hooks
import useInitiativeById from 'api/initiatives/useInitiativeById';
import useIdeaById from 'api/ideas/useIdeaById';
import useUserById from 'api/users/useUserById';

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

  & li {
    margin-right: 12px;

    &:after {
      color: ${colors.textSecondary};
      font-size: ${fontSizes.s}px;
      font-weight: 400;
      content: '•';
      margin-left: 12px;
    }

    ${isRtl`
        margin-left: 12px;
        margin-right: auto;

        &:after {
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
  comment: GetCommentChildProps;
  commentingPermissionInitiative: GetInitiativesPermissionsChildProps;
}

interface Props extends InputProps, DataProps {}

const CommentFooter = ({
  onEditing,
  authUser,
  commentType,
  postId,
  postType,
  projectId,
  commentId,
  className,
  comment,
  tenantLocales,
  locale,
  commentingPermissionInitiative,
}: Props) => {
  const { data: author } = useUserById(comment?.relationships.author.data?.id);
  const initiativeId = postType === 'initiative' ? postId : undefined;
  const ideaId = postType === 'idea' ? postId : undefined;
  const { data: initiative } = useInitiativeById(initiativeId);
  const { data: idea } = useIdeaById(ideaId);
  const post = postType === 'idea' ? idea?.data : initiative?.data;

  if (
    isNilOrError(post) ||
    isNilOrError(comment) ||
    isNilOrError(locale) ||
    isNilOrError(tenantLocales)
  ) {
    return null;
  }

  return (
    <Container className={className || ''}>
      <Left>
        <StyledCommentVote
          postId={postId}
          postType={postType}
          comment={comment}
          commentType={commentType}
        />
        <StyledCommentReplyButton
          postId={postId}
          postType={postType}
          commentId={commentId}
          commentType={commentType}
          authUser={authUser}
          author={author?.data}
          post={post}
          comment={comment}
          commentingPermissionInitiative={commentingPermissionInitiative}
        />
        <Outlet
          id="app.components.PostShowComponents.CommentFooter.left"
          comment={comment}
          locale={locale}
          tenantLocales={tenantLocales}
        />
      </Left>
      <Right>
        <StyledCommentsMoreActions
          projectId={projectId}
          comment={comment}
          onCommentEdit={onEditing}
          postId={postId}
          postType={postType}
        />
      </Right>
    </Container>
  );
};

const Data = adopt<DataProps, InputProps>({
  tenantLocales: <GetAppConfigurationLocales />,
  locale: <GetLocale />,
  authUser: <GetAuthUser />,
  comment: ({ commentId, render }) => (
    <GetComment id={commentId}>{render}</GetComment>
  ),
  commentingPermissionInitiative: (
    <GetInitiativesPermissions action="commenting_initiative" />
  ),
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps: DataProps) => <CommentFooter {...inputProps} {...dataProps} />}
  </Data>
);
