import React from 'react';

import { ProjectMiniAdminData } from 'api/projects_mini_admin/types';

import { ArrangePlace } from '../Arrange/arrangeTargets';
import MoreActions from '../Menu/MoreActions';

import useProjectActions from './useProjectActions';

interface Props {
  project: ProjectMiniAdminData;
  place?: ArrangePlace;
}

// A project's "⋯" on its card or row.
const ProjectActions = ({ project, place }: Props) => {
  const { entries } = useProjectActions(project, place);
  return <MoreActions entries={entries} />;
};

export default ProjectActions;
