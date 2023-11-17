import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

// Components
import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';
import MainHeader from 'containers/MainHeader';

// hooks
import usePhases from 'api/phases/usePhases';
import useProjectById from 'api/projects/useProjectById';

// utils
import {
  getMethodConfig,
  getParticipationMethod,
} from 'utils/configs/participationMethodConfig';
import { isNilOrError } from 'utils/helperUtils';

type ProjectCTABarProps = {
  projectId: string;
};

export const ProjectCTABar = ({ projectId }: ProjectCTABarProps) => {
  const isSmallerThanTablet = useBreakpoint('tablet');
  const isSmallerThanPhone = useBreakpoint('phone');
  const [isVisible, setIsVisible] = useState(false);
  const portalElement = document?.getElementById('topbar-portal');
  const { data: phases } = usePhases(projectId);
  const { data: project } = useProjectById(projectId);

  useEffect(() => {
    let isMounted = true;
    window.addEventListener(
      'scroll',
      () => {
        const actionButtonElement = document.getElementById(
          'participation-detail'
        );
        const actionButtonYOffset = actionButtonElement
          ? actionButtonElement.getBoundingClientRect().top + window.pageYOffset
          : undefined;
        if (isMounted) {
          setIsVisible(
            !!(
              actionButtonElement &&
              actionButtonYOffset &&
              window.pageYOffset >
                actionButtonYOffset - (isSmallerThanTablet ? 14 : 30)
            )
          );
        }
      },
      { passive: true }
    );
    return () => {
      isMounted = false;
    };
  }, [projectId, isSmallerThanTablet]);

  const participationMethod = project
    ? getParticipationMethod(project.data, phases?.data)
    : undefined;

  if (isNilOrError(project) || !participationMethod) {
    return null;
  }

  const BarContents = getMethodConfig(participationMethod).renderCTABar({
    project: project.data,
    phases: phases?.data,
  });

  if (portalElement && isVisible) {
    return createPortal(
      <Box
        width="100vw"
        position="fixed"
        top="0px"
        zIndex="1000"
        background="#fff"
        borderBottom="solid 1px #ddd"
      >
        {!isSmallerThanPhone && (
          <Box height="78px">
            <MainHeader />
          </Box>
        )}
        {BarContents}
      </Box>,
      portalElement
    );
  }

  return <>{BarContents}</>;
};
