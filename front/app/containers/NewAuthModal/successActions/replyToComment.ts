import { commentReplyButtonClicked } from 'components/PostShowComponents/Comments/events';

interface Params {
  commentId: string | null;
  parentCommentId: string | null;
  authorFirstName: string | null;
  authorLastName: string | null;
  authorSlug: string | null;
}

export const replyToComment = (params: Params) => async () => {
  commentReplyButtonClicked(params);
};
