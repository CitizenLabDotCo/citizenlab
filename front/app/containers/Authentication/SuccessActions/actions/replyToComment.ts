import { commentReplyButtonClicked } from 'components/PostShowComponents/Comments/events';

export interface ReplyToCommentParams {
  commentId: string | null;
  parentCommentId: string | null;
  authorFirstName?: string | null;
  authorLastName?: string | null;
  authorId?: string | null;
}

export const replyToComment = (params: ReplyToCommentParams) => async () => {
  commentReplyButtonClicked(params);
};
