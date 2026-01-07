import React from 'react';

import { Box, Spinner, Text } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';
import { Multiloc } from 'typings';

import { useProjectsTimeline } from 'api/graph_data_units';
import { ProjectReportsPublicationStatus } from 'api/graph_data_units/requestTypes';
import { ParticipationMethod } from 'api/phases/types';
import { Visibility } from 'api/projects/types';
import {
  ParticipationState,
  ProjectSortableParam,
} from 'api/projects_mini_admin/types';

import useLocale from 'hooks/useLocale';
import useLocalize from 'hooks/useLocalize';

import { getStatusColor } from 'containers/Admin/projects/all/_shared/utils';

import GanttChart from 'components/UI/GanttChart';
import { GanttItem } from 'components/UI/GanttChart/types';

import { useIntl } from 'utils/cl-intl';

import { DEFAULT_NO_OF_PROJECTS } from './constants';
import messages from './messages';

const StyledBox = styled(Box)`
  box-sizing: border-box;
`;

export interface ProjectsTimelineCardProps {
  title?: Multiloc;
  minStartDate?: string;
  maxStartDate?: string | null;
  status?: ProjectReportsPublicationStatus[];
  showTodayLine?: boolean;
  participationStates?: ParticipationState[];
  visibility?: Visibility[];
  discoverability?: ('listed' | 'unlisted')[];
  managers?: string[];
  folderIds?: string[];
  participationMethods?: ParticipationMethod[];
  sort?: ProjectSortableParam;
  noOfProjects?: number;
  excludedProjectIds?: string[];
  excludedFolderIds?: string[];
}

const ProjectsTimelineCard = ({
  minStartDate,
  maxStartDate,
  status = ['published'],
  showTodayLine = true,
  participationStates = [],
  visibility = [],
  discoverability = [],
  managers = [],
  folderIds = [],
  participationMethods = [],
  sort = 'phase_starting_or_ending_soon',
  noOfProjects = DEFAULT_NO_OF_PROJECTS,
  excludedProjectIds = [],
  excludedFolderIds = [],
}: ProjectsTimelineCardProps) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const locale = useLocale();
  const { data, isLoading } = useProjectsTimeline({
    start_at: undefined,
    end_at: undefined,
    status,
    managers,
    min_start_date: minStartDate,
    max_start_date: maxStartDate || undefined,
    participation_states: participationStates,
    folder_ids: folderIds,
    participation_methods: participationMethods,
    visibility,
    discoverability,
    sort,
    locale,
    no_of_projects: noOfProjects,
    excluded_project_ids: excludedProjectIds,
    excluded_folder_ids: excludedFolderIds,
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
    <StyledBox>
      <GanttChart
        items={ganttItems}
        showTodayLine={showTodayLine}
        chartTitle={formatMessage(messages.projects)}
      />
    </StyledBox>
  );
};

export default ProjectsTimelineCard;
