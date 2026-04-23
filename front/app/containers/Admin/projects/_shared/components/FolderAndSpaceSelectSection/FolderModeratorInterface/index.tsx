import React from 'react';

import { BaseProps } from '../types';

import ExistingProject from './ExistingProject';
import NewProject from './NewProject';

interface Props extends BaseProps {
  isNewProject: boolean;
}

const FolderModeratorInterface = ({ isNewProject, ...props }: Props) => {
  if (isNewProject) {
    return <NewProject {...props} />;
  }

  return <ExistingProject {...props} />;
};

export default FolderModeratorInterface;
