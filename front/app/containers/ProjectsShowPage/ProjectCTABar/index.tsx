import React from 'react';

import {
  Box,
  BoxProps,
  colors,
  stylingConsts,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';

import usePhases from 'api/phases/usePhases';
import useProjectById from 'api/projects/useProjectById';

import {
  getMethodConfig,
  getParticipationMethod,
} from 'utils/configs/participationMethodConfig';
import { MIN_VIEWPORT_HEIGHT_FOR_STICKY_ELEMENTS } from 'utils/styleConstants';

type ProjectCTABarProps = {
  projectId: string;
};

const ProjectCTABar = ({ projectId }: ProjectCTABarProps) => {
  const isSmallerThanTablet = useBreakpoint('tablet');
  const viewportHeight = window.innerHeight;
  // Only stick on height over 400, to prevent a11y issues on very small viewports
  const sticksToBottom =
    isSmallerThanTablet &&
    viewportHeight > MIN_VIEWPORT_HEIGHT_FOR_STICKY_ELEMENTS;
  const { data: phases } = usePhases(projectId);
  const { data: project } = useProjectById(projectId);

  const participationMethod = project
    ? getParticipationMethod(project.data, phases?.data)
    : undefined;

  if (!project || !participationMethod) {
    return null;
  }

  // WARNING: BarContents types are wrong. Can also be null.
  const BarContents = getMethodConfig(participationMethod).renderCTABar({
    project: project.data,
    phases: phases?.data,
  });
  const sharedProps: BoxProps = {
    width: '100vw',
    zIndex: '1000',
    background: colors.white,
  };
  const otherProps: BoxProps = sticksToBottom
    ? {
        // This id is needed to add padding to PlatformFooter
        id: 'project-cta-bar-bottom',
        position: 'fixed',
        bottom: '0px',
      }
    : {
        position: 'sticky',
        top: `${stylingConsts.menuHeight}px`,
      };

  return (
    <Box {...sharedProps} {...otherProps}>
      {BarContents}
    </Box>
  );
};

export default ProjectCTABar;
