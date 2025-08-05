import { Multiloc } from 'typings';

import { IProjectData, PublicationStatus } from 'api/projects/types';

export interface TimelineItem {
  id: string;
  title: Multiloc;
  start_date: string;
  end_date: string | null;
  current_phase_start_date: string | null;
  current_phase_end_date: string | null;
  publication_status: PublicationStatus;
  folder_title_multiloc: Multiloc | null;
}

export type ProjectsTimelineResponse = {
  data: {
    type: 'report_builder_data_units';
    attributes: {
      timeline_items: TimelineItem[];
      projects: IProjectData[];
    };
  };
};
