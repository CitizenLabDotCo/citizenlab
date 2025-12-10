export type Templates = {
  edges: {
    node: {
      id: string;
      cardImage: string | null;
      titleMultiloc: {
        [key: string]: string;
      };
      subtitleMultiloc: {
        [key: string]: string;
      };
      departments: {
        id: string;
        titleMultiloc: {
          [key: string]: string;
        };
      }[];
      purposes: {
        id: string;
        titleMultiloc: {
          [key: string]: string;
        };
      }[];
      participationLevels: {
        id: string;
        titleMultiloc: {
          [key: string]: string;
        };
      }[];
    };
    cursor: string;
  }[];
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string | null;
  };
} | null;
