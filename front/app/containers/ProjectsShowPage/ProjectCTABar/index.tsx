import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

// Components
import { Box, Text, Icon, colors } from '@citizenlab/cl2-component-library';
import MainHeader from 'containers/MainHeader';
import { CTAButton } from 'containers/ProjectsShowPage/ProjectCTABar/CTAButton';

// hooks
import { useTheme } from 'styled-components';
import { useWindowSize } from '@citizenlab/cl2-component-library';
import usePhases from 'hooks/usePhases';

// style
import styled from 'styled-components';
import { lighten } from 'polished';
import { media, viewportWidths } from 'utils/styleUtils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from 'containers/ProjectsShowPage/messages';

// services
import { getCurrentPhase } from 'services/phases';

// utils
import { getPeriodRemainingUntil } from 'utils/dateUtils';

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
  const theme = useTheme();
  const { windowWidth } = useWindowSize();
  const smallerThanLargeTablet = windowWidth <= viewportWidths.tablet;
  const [isVisible, setIsVisible] = useState(false);
  const portalElement = document?.getElementById('topbar-portal');
  const phases = usePhases(projectId);
  const currentPhase = getCurrentPhase(phases);
  const timeLeft = currentPhase
    ? getPeriodRemainingUntil(currentPhase.attributes.end_at, 'weeks')
    : '';

  useEffect(() => {
    window.addEventListener(
      'scroll',
      () => {
        const actionButtonElement =
          document.getElementById('project-ideabutton');
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

  const BarContents = (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-around"
      flexDirection="row"
      width="100%"
      bgColor={theme.colors.tenantPrimary}
      height="62px"
    >
      <Box display="flex" justifyContent="center" alignItems="center">
        <Icon
          name="dot"
          width="12px"
          height="12px"
          fill={colors.white}
          mr="6px"
        />
        <Text color="white">
          <FormattedMessage {...messages.projectOpenForSubmission} />
        </Text>
      </Box>
      <Box display="flex" alignItems="center">
        {timeLeft && (
          <Text color="white" style={{ textTransform: 'uppercase' }} mr="12px">
            <FormattedMessage
              {...messages.participationTimeLeft}
              values={{
                timeLeft: timeLeft,
              }}
            />
          </Text>
        )}
        <CTAButton projectId={projectId} phases={phases} />
      </Box>
    </Box>
  );

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
