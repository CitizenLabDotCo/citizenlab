import eventEmitter from 'utils/eventEmitter';

enum events {
  commentReplyButtonClicked = 'commentReplyButtonClicked',
  commentTranslateButtonClicked = 'commentTranslateButtonClicked',
  commentAdded = 'commentAdded',
  commentDeleted = 'commentDeleted',
}

// -----------

interface ICommentReplyClicked {
  commentId: string | null;
  parentCommentId: string | null;
  authorFirstName: string | null;
  authorLastName: string | null;
  authorSlug: string | null;
}

export const commentReplyButtonClicked = (eventValue: ICommentReplyClicked) =>
  eventEmitter.emit<ICommentReplyClicked>(
    events.commentReplyButtonClicked,
    eventValue
  );
export const commentReplyButtonClicked$ =
  eventEmitter.observeEvent<ICommentReplyClicked>(
    events.commentReplyButtonClicked
  );

// -----------

export const commentTranslateButtonClicked = (commentId: string) =>
  eventEmitter.emit<string>(events.commentTranslateButtonClicked, commentId);
export const commentTranslateButtonClicked$ = eventEmitter.observeEvent<string>(
  events.commentTranslateButtonClicked
);

// -----------

export const commentAdded = () => eventEmitter.emit(events.commentAdded);
export const commentAdded$ = eventEmitter.observeEvent(events.commentAdded);

// -----------

export const commentDeleted = () => eventEmitter.emit(events.commentDeleted);
export const commentDeleted$ = eventEmitter.observeEvent(events.commentDeleted);

// -----------

export const deleteCommentModalClosed = () => eventEmitter.emit('modalClosed');

// -----------
