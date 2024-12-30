import { IInternalCommentData, IPresentInternalComment } from '../types';

export const links = {
  last: 'http://localhost:3000/web_api/v1/ideas?page%5Bnumber%5D=9&page%5Bsize%5D=12&sort=random',
  next: 'http://localhost:3000/web_api/v1/ideas?page%5Bnumber%5D=2&page%5Bsize%5D=12&sort=random',
  self: 'http://localhost:3000/web_api/v1/ideas?page%5Bnumber%5D=1&page%5Bsize%5D=12&sort=random',
  first:
    'http://localhost:3000/web_api/v1/ideas?page%5Bnumber%5D=1&page%5Bsize%5D=12&sort=random',
  prev: null,
};

export const mockCommentDataAttributes1: IPresentInternalComment = {
  body: 'body_text',
  created_at: 'created_at',
  publication_status: 'published',
  children_count: 0,
  updated_at: 'updated_at',
};

export const mockCommentData1: IInternalCommentData = {
  id: 'commentId',
  type: 'internal_comment',
  attributes: mockCommentDataAttributes1,
  relationships: {
    idea: {
      data: {
        id: 'postId',
        type: 'post',
      },
    },
    author: {
      data: {
        id: 'authorId',
        type: 'author',
      },
    },
    parent: {
      data: {
        id: 'parentId',
        type: 'parent',
      },
    },
  },
};

export const commentsData: IInternalCommentData[] = [
  mockCommentData1,
  {
    id: 'commentId2',
    type: 'internal_comment',
    attributes: {
      body: 'body_text',
      created_at: 'created_at',
      publication_status: 'published',
      children_count: 0,
      updated_at: 'updated_at',
    },
    relationships: {
      idea: {
        data: {
          id: 'postId2',
          type: 'post',
        },
      },
      author: {
        data: {
          id: 'authorId2',
          type: 'author',
        },
      },
      parent: {
        data: {
          id: 'parentId2',
          type: 'parent',
        },
      },
    },
  },
];

export default jest.fn(() => {
  return { data: { data: commentsData, links } };
});
