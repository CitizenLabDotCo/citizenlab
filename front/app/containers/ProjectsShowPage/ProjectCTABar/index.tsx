import React, { useEffect, useState } from 'react';

import {
  Box,
  BoxProps,
  colors,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import { createPortal } from 'react-dom';

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
  const isSmallerThanTablet = useBreakpoint('tablet');
  const isSmallerThanPhone = useBreakpoint('phone');
  // On devices larger than phones, the sticky CTA bar is only visible when the action button is out of view
  const [sticksToTop, setSticksToTop] = useState(false);
  // The CTA bar is always visible on phones
  const sticksToBottom = isSmallerThanPhone;
  const isSticky = sticksToBottom || sticksToTop;
  const portalElement = document.getElementById('topbar-portal');
  const { data: phases } = usePhases(projectId);
  const { data: project } = useProjectById(projectId);

  useEffect(() => {
    const handleScroll = () => {
      const actionButtonElement = document.getElementById(
        'participation-detail'
      );
      const actionButtonYOffset = actionButtonElement
        ? actionButtonElement.getBoundingClientRect().top + window.scrollY
        : undefined;

      setSticksToTop(
        !!(
          actionButtonElement &&
          actionButtonYOffset &&
          window.scrollY > actionButtonYOffset - (isSmallerThanTablet ? 14 : 30)
        )
      );
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isSmallerThanTablet]);

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

  if (isSticky && portalElement) {
    const sharedProps: BoxProps = {
      width: '100vw',
      position: 'fixed',
      zIndex: '1000',
      background: colors.white,
      id: 'project-cta-bar',
    };

    return createPortal(
      sticksToBottom ? (
        <Box bottom="0px" {...sharedProps}>
          {BarContents}
        </Box>
      ) : (
        <Box top="0px" {...sharedProps}>
          <Box height="78px">
            <MainHeader />
          </Box>
          {BarContents}
        </Box>
      ),
      portalElement
    );
  }

  return <>{BarContents}</>;
};

export default ProjectCTABar;
