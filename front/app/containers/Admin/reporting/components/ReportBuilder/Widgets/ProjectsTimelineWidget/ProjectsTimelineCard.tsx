import React from 'react';

import { first } from 'lodash-es';
import moment from 'moment';
import { Multiloc } from 'typings';

import { ParticipationMethod } from 'api/phases/types';
import { PublicationStatus, Visibility } from 'api/projects/types';
import {
  ProjectMiniAdminData,
  ParticipationState,
} from 'api/projects_mini_admin/types';
import useInfiniteProjectsMiniAdmin from 'api/projects_mini_admin/useInfiniteProjectsMiniAdmin';

import { getStatusColor } from 'containers/Admin/projects/all/new/_shared/utils';

import GanttChart from 'components/UI/GanttChart';
import { GanttItem } from 'components/UI/GanttChart/types';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

export interface ProjectsTimelineCardProps {
  title?: Multiloc;
  startAt?: string;
  endAt?: string | null;
  publicationStatuses?: PublicationStatus[];
  showTodayLine?: boolean;
  participationStates?: ParticipationState[];
  visibility?: Visibility[];
  discoverability?: ('listed' | 'unlisted')[];
  managers?: string[];
  folderIds?: string[];
  participationMethods?: ParticipationMethod[];
}

const ProjectsTimelineCard = ({
  startAt,
  endAt,
  publicationStatuses = ['published'],
  showTodayLine = true,
  participationStates = [],
  visibility = [],
  discoverability = [],
  managers = [],
  folderIds = [],
  participationMethods = [],
}: ProjectsTimelineCardProps) => {
  const { formatMessage } = useIntl();
  const { data: response, isLoading } = useInfiniteProjectsMiniAdmin({
    status: publicationStatuses,
    participation_states: participationStates,
    visibility,
    discoverability,
    managers,
    folder_ids: folderIds,
    participation_methods: participationMethods,
    min_start_date: startAt || undefined,
    max_start_date: endAt || undefined,
    sort: 'phase_starting_or_ending_soon',
  });

  if (isLoading || !response) return null;

  const allProjects = response.pages.flatMap((page) => page.data);
  const projectsById: Record<string, ProjectMiniAdminData> = {};
  const ganttItems: GanttItem[] = [];

  for (const project of allProjects) {
    projectsById[project.id] = project;

    // Use phase dates for better Gantt chart representation
    const startDate =
      project.attributes.first_phase_start_date ||
      project.attributes.first_published_at;
    const endDate = project.attributes.last_phase_end_date;

    ganttItems.push({
      id: project.id,
      title: project.attributes.title_multiloc.en || '',
      start: startDate,
      end: endDate,
      folder: project.attributes.folder_title_multiloc?.en,
      color: getStatusColor(project.attributes.publication_status),
      highlight: project.attributes.current_phase_start_date
        ? {
            start: project.attributes.current_phase_start_date,
            end: project.attributes.current_phase_end_date,
          }
        : undefined,
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
    <GanttChart
      items={ganttItems}
      showTodayLine={showTodayLine}
      chartTitle={formatMessage(messages.projects)}
    />
  );
};

export default ProjectsTimelineCard;
