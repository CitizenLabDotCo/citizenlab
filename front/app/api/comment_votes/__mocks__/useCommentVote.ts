import { ICommentVote } from '../types';

export const voteData: ICommentVote = {
  data: {
    id: 'voteId',
    type: 'vote',
    attributes: {
      mode: 'up',
    },
    relationships: {
      votable: {
        data: {
          id: 'ideaId',
          type: 'votable',
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
  return { data: { data: voteData } };
});
