import React from 'react';

import Card from '../_shared/Card';

import messages from './messages';
import ProjectsCard from './ProjectsCard';
import Settings from './Settings';
import { Props } from './typings';

const ProjectsWidget = ({ title, ...props }: Props) => {
  return (
    <Card title={title} pagebreak>
      <ProjectsCard {...props} />
    </Card>
  );
};

ProjectsWidget.craft = {
  props: {
    title: {},
    startAt: undefined,
    endAt: undefined,
    publicationStatus: undefined,
    excludedProjectIds: [],
    excludedFolderIds: [],
    sort: undefined,
  },
  related: {
    settings: Settings,
  },
};

export const projectsTitle = messages.projects;

export default ProjectsWidget;
