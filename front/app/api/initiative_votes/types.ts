export interface IInitiativeReactionData {
  id: string;
  type: 'reaction';
  attributes: {
    mode: 'up' | 'down';
  };
  relationships: {
    reactable: {
      data: {
        id: string;
        type: 'reactable';
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
export interface IInitiativeReaction {
  data: IInitiativeReactionData;
}

export interface INewReactionProperties {
  initiativeId: string;
  user_id?: string;
  mode: 'up' | 'down';
}
