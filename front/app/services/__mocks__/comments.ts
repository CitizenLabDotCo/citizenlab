import { ICommentData, IComment, IComments } from 'services/comments';
import { BehaviorSubject } from 'rxjs';

export const makeCommentData = (
  id = 'commentId',
  attributes = {},
  ideaId?: string,
  authorId?: string,
  parentId?: string
): ICommentData => ({
  id,
  type: 'comment',
  attributes: {
    body_multiloc: { en: 'Just a comment' },
    publication_status: 'published',
    upvotes_count: 0,
    downvotes_count: 0,
    created_at: '2019-03-12T00: 00: 00.000Z',
    updated_at: '2019-03-26T14: 32: 32.000Z',
    children_count: 0,
    ...attributes,
  },
  relationships: {
    post: {
      data: {
        id: ideaId ? ideaId : 'ideaId',
        type: 'idea',
      },
    },
    author: {
      data: {
        id: authorId ? authorId : 'authorId',
        type: 'user',
      },
    },
    parent: {
      data: parentId
        ? {
            id: parentId,
            type: 'comment',
          }
        : null,
    },
    user_vote: {
      data: null,
    },
  },
});

export const makeComment = (
  id = 'commentId',
  attributes = {},
  ideaId?: string,
  authorId?: string,
  parentId?: string
): IComment => ({
  data: makeCommentData(id, attributes, ideaId, authorId, parentId),
});

export const makeComments = (
  argumentsArray = [
    {
      id: undefined,
      attributes: {},
      ideaId: undefined,
      authorId: undefined,
      parentId: undefined,
    },
  ]
): IComments => ({
  data: argumentsArray.map((args) =>
    makeCommentData(
      args.id,
      args.attributes,
      args.ideaId,
      args.authorId,
      args.parentId
    )
  ),
  links: {
    self: 'self',
    first: 'first',
    last: 'last',
    prev: 'prev',
    next: 'next',
  },
});

const mockCommentsForUser = new BehaviorSubject<undefined | IComments>(
  undefined
);

export const __setMockCommentsForUser = (comments: IComments) => {
  mockCommentsForUser.next(comments);
};

export const commentsForUserStream = jest.fn(() => {
  return {
    observable: mockCommentsForUser,
  };
});
