export type DemographicsResponse = {
  data: {
    type: 'report_builder_data_units';
    attributes: {
      series: {
        [key: string]: number;
      };
      // options is undefined for users by birthyear
      options?: {
        [key: string]: {
          title_multiloc: {
            [key: string]: string;
          };
          ordering: number;
        };
      };
      population_distribution?: {
        [key: string]: number;
      };
      r_score?: number;
    };
  };
};
