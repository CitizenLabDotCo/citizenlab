import { IProjectData } from 'api/projects/types';

export type ProjectsResponse = {
  data: {
    type: 'report_builder_data_units';
    attributes: {
      projects: IProjectData[];
    };
  };
};
