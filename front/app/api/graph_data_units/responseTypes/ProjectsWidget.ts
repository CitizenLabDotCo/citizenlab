import { IProjectImageData } from 'api/project_images/types';
import { IProjectData } from 'api/projects/types';

export type Period = {
  start_at: string;
  last_phase_start_at: string;
  end_at: string | null;
};

export type ProjectsResponse = {
  data: {
    type: 'report_builder_data_units';
    attributes: {
      projects: IProjectData[];
      project_images: Record<string, IProjectImageData>;
      periods: Record<string, Period>;
      participants: Record<string, number>;
    };
  };
};
