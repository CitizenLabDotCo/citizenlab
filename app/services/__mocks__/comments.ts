import { ICommentData } from 'services/comments';
import { BehaviorSubject } from 'rxjs';

export const makeCommentData = (attributes = {}, relationships = {}) : ICommentData => ({
  id: 'commentId',
  type: 'comments',
  attributes: {
    body_multiloc: { en: 'Just a comment' },
    publication_status: 'published',
    upvotes_count: 0,
    downvotes_count: 0,
    created_at: '2019-03-12T00: 00: 00.000Z',
    updated_at: '2019-03-26T14: 32: 32.000Z',
    children_count: 0
  }
  relationships: {
    idea: {
      data: {
        id: 'ideaId',
        type: 'ideas'
      }
    },
    author: {
      data: {
        id: 'authorId',
        type: 'users'
      }
    },
    user_vote: {
      data: null
    }
  }
});
