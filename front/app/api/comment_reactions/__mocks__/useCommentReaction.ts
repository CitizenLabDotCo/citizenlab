import { ICommentReaction } from '../types';

export const reactionData: ICommentReaction = {
  data: {
    id: 'reactionId',
    type: 'reaction',
    attributes: {
      mode: 'up',
    },
    relationships: {
      reactable: {
        data: {
          id: 'ideaId',
          type: 'reactable',
        },
      },
      user: {
        data: {
          id: 'userId',
          type: 'user',
        },
      },
    },
  },
};

export default jest.fn(() => {
  return { data: { data: reactionData } };
});
