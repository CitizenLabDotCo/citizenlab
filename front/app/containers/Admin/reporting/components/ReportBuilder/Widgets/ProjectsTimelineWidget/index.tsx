import React from 'react';

import Card from '../_shared/Card';

import messages from './messages';
import ProjectsTimelineCard, {
  ProjectsTimelineCardProps,
} from './ProjectsTimelineCard';
import Settings from './Settings';

const ProjectsTimelineWidget = ({
  title,
  ...props
}: ProjectsTimelineCardProps) => {
  return (
    <Card title={title} pagebreak>
      <ProjectsTimelineCard {...props} />
    </Card>
  );
};

ProjectsTimelineWidget.craft = {
  props: {
    title: {},
    publicationStatuses: ['published'],
    defaultTimeRange: 'year',
    showTodayLine: true,
    colorByStatus: true,
    participationStates: [],
    visibility: [],
    discoverability: [],
    managers: [],
    folderIds: [],
    participationMethods: [],
    sort: 'phase_starting_or_ending_soon',
    numberOfProjects: 10,
  },
  related: {
    settings: Settings,
  },
};

export const projectsTimelineTitle = messages.projectsTimeline;

export default ProjectsTimelineWidget;
