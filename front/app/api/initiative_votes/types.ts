export interface IInitiativeVoteData {
  id: string;
  type: 'vote';
  attributes: {
    mode: 'up' | 'down';
  };
  relationships: {
    votable: {
      data: {
        id: string;
        type: 'votable';
      };
    };
    user: {
      data: {
        id: string;
        type: 'user';
      };
    };
  };
}
export interface IInitiativeVote {
  data: IInitiativeVoteData;
}

export interface INewVoteProperties {
  initiativeId: string;
  user_id?: string;
  mode: 'up' | 'down';
}
