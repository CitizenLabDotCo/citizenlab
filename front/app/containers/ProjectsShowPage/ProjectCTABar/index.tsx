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

type ProjectCTABarProps = {
  projectId: string;
};

const ProjectCTABar = ({ projectId }: ProjectCTABarProps) => {
  const isSmallerThanPhone = useBreakpoint('phone');
  const sticksToBottom = isSmallerThanPhone;
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

  if (sticksToBottom) {
    return (
      <Box
        // This id is needed to add padding to PlatformFooter
        id="project-cta-bar-bottom"
        position="fixed"
        bottom="0px"
        {...sharedProps}
      >
        {BarContents}
      </Box>
    );
  } else {
    return (
      <Box
        position="sticky"
        top={`${stylingConsts.menuHeight}px`}
        {...sharedProps}
      >
        {BarContents}
      </Box>
    );
  }
};

export default ProjectCTABar;
