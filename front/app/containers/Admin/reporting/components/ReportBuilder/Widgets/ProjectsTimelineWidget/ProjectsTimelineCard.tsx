import React from 'react';

import { Box, Spinner, Text } from '@citizenlab/cl2-component-library';
import { Multiloc } from 'typings';

import { useProjectsTimeline } from 'api/graph_data_units';
import { ProjectReportsPublicationStatus } from 'api/graph_data_units/requestTypes';
import { ParticipationMethod } from 'api/phases/types';
import { Visibility } from 'api/projects/types';
import {
  ParticipationState,
  ProjectSortableParam,
} from 'api/projects_mini_admin/types';

import useLocalize from 'hooks/useLocalize';

import { getStatusColor } from 'containers/Admin/projects/all/new/_shared/utils';

import GanttChart from 'components/UI/GanttChart';
import { GanttItem } from 'components/UI/GanttChart/types';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

export interface ProjectsTimelineCardProps {
  title?: Multiloc;
  startAt?: string;
  endAt?: string | null;
  publicationStatuses?: ProjectReportsPublicationStatus[];
  showTodayLine?: boolean;
  participationStates?: ParticipationState[];
  visibility?: Visibility[];
  discoverability?: ('listed' | 'unlisted')[];
  managers?: string[];
  folderIds?: string[];
  participationMethods?: ParticipationMethod[];
  sort?: ProjectSortableParam;
  numberOfProjects?: number;
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
  sort = 'phase_starting_or_ending_soon',
  numberOfProjects = 10,
}: ProjectsTimelineCardProps) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { data, isLoading } = useProjectsTimeline({
    start_at: startAt,
    end_at: endAt,
    publication_statuses: publicationStatuses,
    participation_states: participationStates,
    visibility,
    discoverability,
    managers,
    folder_ids: folderIds,
    participation_methods: participationMethods,
    sort,
    number_of_projects: numberOfProjects,
  });

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py="40px">
        <Spinner />
      </Box>
    );
  }

  if (
    !data?.data.attributes.timeline_items ||
    data.data.attributes.timeline_items.length === 0
  ) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py="40px">
        <Text variant="bodyL" color="textSecondary">
          {formatMessage(messages.noProjectsFound)}
        </Text>
      </Box>
    );
  }

  const timelineItems = data.data.attributes.timeline_items;
  const ganttItems: GanttItem[] = timelineItems.map((item) => ({
    id: item.id,
    title: localize(item.title),
    start: item.start_date,
    end: item.end_date,
    folder: localize(item.folder_title_multiloc),
    color: getStatusColor(item.publication_status),
    highlight: item.current_phase_start_date
      ? {
          start: item.current_phase_start_date,
          end: item.current_phase_end_date,
        }
      : undefined,
  }));

  return (
    <GanttChart
      items={ganttItems}
      showTodayLine={showTodayLine}
      chartTitle={formatMessage(messages.projects)}
    />
  );
};

export default ProjectsTimelineCard;
