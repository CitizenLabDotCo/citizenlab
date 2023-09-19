export interface IdeasPhase {
  data: {
    id: string;
    type: 'ideas_phase';
    attributes: {
      baskets_count: number;
      votes_count: number;
    };
    relationships: {
      idea: {
        data: {
          id: string;
          type: 'idea';
        };
        phase: {
          id: string;
          type: 'phase';
        };
      };
    };
  };
}
