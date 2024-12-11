import React from 'react';

import {
  Box,
  BoxProps,
  colors,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';

import usePhases from 'api/phases/usePhases';
import useProjectById from 'api/projects/useProjectById';

import MainHeader from 'containers/MainHeader';

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
        // This is is needed to determine how much to push down the input filters
        // (top in ContentRight)
        id="project-cta-bar-top"
        position="sticky"
        top="0px"
        {...sharedProps}
      >
        <Box height="78px">
          <MainHeader />
        </Box>
        {BarContents}
      </Box>
    );
  }
};

export default ProjectCTABar;
