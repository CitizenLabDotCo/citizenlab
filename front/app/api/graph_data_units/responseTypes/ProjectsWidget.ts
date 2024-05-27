import { IProjectImageData } from 'api/project_images/types';
import { IProjectData } from 'api/projects/types';

export type ProjectsResponse = {
  data: {
    type: 'report_builder_data_units';
    attributes: {
      projects: IProjectData[];
      project_images: Record<string, IProjectImageData>;
      periods: Record<string, { start_at: string; end_at: string | null }>;
    };
  };
};
