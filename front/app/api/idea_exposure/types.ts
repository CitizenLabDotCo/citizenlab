export interface IIdeaExposureData {
  id: string;
  type: 'idea_exposure';
  attributes: {
    created_at: string;
  };
  relationships: {
    idea: {
      data: {
        id: string;
        type: 'idea';
      };
    };
    user: {
      data: {
        id: string;
        type: 'user';
      } | null;
    };
  };
}

export interface IIdeaExposure {
  data: IIdeaExposureData;
}
