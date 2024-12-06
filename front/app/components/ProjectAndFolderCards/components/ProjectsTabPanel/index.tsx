import React from 'react';

import { PublicationTab } from '../..';
import { BaseProps } from '../PublicationStatusTabs';

import DynamicLayout from './DynamicLayout';
import ThreeColumnLayout from './ThreeColumnLayout';

interface Props extends BaseProps {
  tab: PublicationTab;
  hasMoreThanOneTab: boolean;
}

const ProjectsTabPanel = ({ layout, ...props }: Props) => {
  if (layout === 'dynamic') {
    return <DynamicLayout {...props} />;
  }

  return <ThreeColumnLayout {...props} />;
};

export default ProjectsTabPanel;
