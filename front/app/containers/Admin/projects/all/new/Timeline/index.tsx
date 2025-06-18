import React from 'react';

import { Spinner, Text } from '@citizenlab/cl2-component-library';

import useProjectsMiniAdmin from 'api/projects_mini_admin/useProjectsMiniAdmin';

import useLocalize from 'hooks/useLocalize';

import Centerer from 'components/UI/Centerer';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import ProjectGanttChart, { GanttProject } from './ProjectGanttChart';

const Timeline = () => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const {
    data: projects,
    isLoading,
    isError,
  } = useProjectsMiniAdmin({
    sort: 'phase_starting_or_ending_soon',
  });

  const projectsGanttData: GanttProject[] = (projects?.data || []).map(
    (project) => ({
      id: project.id,
      title: localize(project.attributes.title_multiloc),
      start: project.attributes.first_phase_start_date,
      end: project.attributes.last_phase_end_date,
      folder: localize(project.attributes.folder_title_multiloc),
      daysLeft: 63,
    })
  );

  if (isLoading) {
    return (
      <Centerer>
        <Spinner />
      </Centerer>
    );
  }

  if (isError) {
    return <Text>{formatMessage(messages.failedToLoadTimelineError)}</Text>;
  }

  return <ProjectGanttChart projects={projectsGanttData} />;
};

export default Timeline;
