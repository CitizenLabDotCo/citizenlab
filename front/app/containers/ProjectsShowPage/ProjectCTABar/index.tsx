import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

// Components
import { Box, colors } from '@citizenlab/cl2-component-library';
import MainHeader from 'containers/MainHeader';

// hooks
import { useWindowSize } from '@citizenlab/cl2-component-library';
import usePhases from 'hooks/usePhases';
import useProject from 'hooks/useProject';

// style
import styled from 'styled-components';
import { lighten } from 'polished';
import { media, viewportWidths } from 'utils/styleUtils';

// utils
import { getMethodConfig } from 'utils/participationMethodUtils';
import { isNilOrError } from 'utils/helperUtils';
import { getParticipationMethod } from 'utils/participationMethodUtils';

const Container = styled.div`
  width: 100vw;
  position: fixed;
  top: 0px;
  z-index: 1004;
  background: #fff;
  border-bottom: solid 1px #ddd;
  opacity: 0;
  pointer-events: none;
  will-change: opacity;

  opacity: 100;
  pointer-events: auto;

  ${media.tablet`
    top: 0px;
    border-bottom: solid 1px ${lighten(0.4, colors.textSecondary)};
  `}
`;

type ProjectCTABarProps = {
  projectId: string;
};

export const ProjectCTABar = ({ projectId }: ProjectCTABarProps) => {
  const { windowWidth } = useWindowSize();
  const smallerThanLargeTablet = windowWidth <= viewportWidths.tablet;
  const [isVisible, setIsVisible] = useState(false);
  const portalElement = document?.getElementById('topbar-portal');
  const phases = usePhases(projectId);

  useEffect(() => {
    window.addEventListener(
      'scroll',
      () => {
        const actionButtonElement = document.getElementById(
          'participation-detail'
        );
        const actionButtonYOffset = actionButtonElement
          ? actionButtonElement.getBoundingClientRect().top + window.pageYOffset
          : undefined;
        setIsVisible(
          !!(
            actionButtonElement &&
            actionButtonYOffset &&
            window.pageYOffset >
              actionButtonYOffset - (smallerThanLargeTablet ? 14 : 30)
          )
        );
      },
      { passive: true }
    );
  }, [projectId, smallerThanLargeTablet]);

  const project = useProject({ projectId });
  const participationMethod = project
    ? getParticipationMethod(project, phases)
    : undefined;

  if (isNilOrError(project) || !participationMethod) {
    return null;
  }

  const BarContents = getMethodConfig(participationMethod).renderCTABar({
    project,
    phases,
  });

  if (portalElement && isVisible) {
    return createPortal(
      <>
        <Container>
          <Box height="78px">
            <MainHeader />
          </Box>
          {BarContents}
        </Container>
      </>,
      portalElement
    );
  }

  return <>{BarContents}</>;
};
