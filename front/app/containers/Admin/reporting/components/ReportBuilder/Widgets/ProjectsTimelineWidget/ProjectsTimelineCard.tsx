import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { first } from 'lodash-es';
import moment from 'moment';
import { Multiloc } from 'typings';

import { useProjectsTimeline } from 'api/graph_data_units';
import { ProjectReportsPublicationStatus } from 'api/graph_data_units/requestTypes';
import { IProjectData } from 'api/projects/types';

import GanttChart from 'components/UI/GanttChart';
import { GanttItem } from 'components/UI/GanttChart/types';

export interface ProjectsTimelineCardProps {
  title?: Multiloc;
  startAt?: string;
  endAt?: string | null;
  publicationStatuses?: ProjectReportsPublicationStatus[];
}

const ProjectsTimelineCard = ({
  startAt,
  endAt,
  publicationStatuses,
}: ProjectsTimelineCardProps) => {
  const { data: response } = useProjectsTimeline({
    start_at: startAt,
    end_at: endAt,
    publication_statuses: publicationStatuses,
  });
  if (!response) return null;

  const projects = response.data.attributes.projects;
  const projectsById: Record<string, IProjectData> = {};
  const ganttItems: GanttItem[] = [];

  for (const project of projects) {
    projectsById[project.id] = project;
    ganttItems.push({
      id: project.id,
      title: project.attributes.title_multiloc.en || '',
      start: project.attributes.created_at,
      end: project.attributes.updated_at,
    });
  }

  const minDate = first(
    ganttItems.sort((a, b) =>
      moment(a.start as string).diff(moment(b.start as string))
    )
  )?.start;
  const maxDate = first(
    ganttItems.sort((a, b) =>
      moment(b.end as string).diff(moment(a.end as string))
    )
  )?.end;

  if (!minDate || !maxDate) return null;

  return (
    <Box>
      <GanttChart items={ganttItems} />
    </Box>
  );
};

export default ProjectsTimelineCard;
