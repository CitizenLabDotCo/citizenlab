import { IUserData } from 'api/users/types';
import { addCommentReaction } from 'api/comment_reactions/useAddCommentReaction';
import { deleteCommentReaction } from 'api/comment_reactions/useDeleteCommentReaction';
import {
  trackLike,
  trackCancelLike,
} from 'components/PostShowComponents/Comments/Comment/CommentReaction/trackReaction';
import commentsKeys from 'api/comments/keys';
import { queryClient } from 'utils/cl-react-query/queryClient';
import eventsAttendancesKeys from 'api/event_attendance/keys';

export interface AttendEventParams {
  eventId: string;
  alreadyAttending: boolean;
}

export const attendEvent =
  ({ alreadyAttending, eventId }: AttendEventParams) =>
  async (authUser: IUserData) => {
    if (!alreadyAttending) {
      //   await addCommentReaction({
      //     commentId,
      //     userId: authUser.id,
      //     mode: 'up',
      //   });
      //   trackLike(commentType);
    }
    queryClient.invalidateQueries({
      queryKey: eventsAttendancesKeys.list({ eventId }),
    });
  };
