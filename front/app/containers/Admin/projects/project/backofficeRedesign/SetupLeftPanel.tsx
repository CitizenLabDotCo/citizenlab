import React from 'react';

import { Box, bo, colors } from '@citizenlab/cl2-component-library';

import { IProjectData } from 'api/projects/types';

import { HeaderDropdownName } from './Header/HeaderDropdown';
import ProjectSetupPanel from './ProjectSetupPanel';

// The left column is the project-level setup checklist. Drafting with AI now
// happens in the create modal, and changes afterwards go through the floating
// "chat to change anything" over the preview — so the assistant no longer needs
// a tab here. This stays as the panel wrapper (fixed width, white surface).
const WIDTH = '332px';

interface Props {
  project: IProjectData;
  onOpenDropdown: (dropdown: HeaderDropdownName) => void;
}

const SetupLeftPanel = ({ project, onOpenDropdown }: Props) => (
  <Box
    flex={`0 0 ${WIDTH}`}
    width={WIDTH}
    minHeight="0"
    overflowY="auto"
    borderRadius={bo.panelBorderRadius}
    background={colors.white}
  >
    <ProjectSetupPanel project={project} onOpenDropdown={onOpenDropdown} />
  </Box>
);

export default SetupLeftPanel;
