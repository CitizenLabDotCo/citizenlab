import React, { useEffect, useState } from 'react';

import {
  Box,
  BoxProps,
  colors,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import { createPortal } from 'react-dom';

import { ParticipationMethod } from 'api/phases/types';
import usePhases from 'api/phases/usePhases';
import useProjectById from 'api/projects/useProjectById';

import MainHeader from 'containers/MainHeader';

import DocumentAnnotationCTABar from 'components/ParticipationCTABars/DocumentAnnotationCTABar';
import EmbeddedSurveyCTABar from 'components/ParticipationCTABars/EmbeddedSurveyCTABar';
import EventsCTABar from 'components/ParticipationCTABars/EventsCTABar';
import IdeationCTABar from 'components/ParticipationCTABars/IdeationCTABar';
import NativeSurveyCTABar from 'components/ParticipationCTABars/NativeSurveyCTABar';
import PollCTABar from 'components/ParticipationCTABars/PollCTABar';
import VolunteeringCTABar from 'components/ParticipationCTABars/VolunteeringCTABar';
import VotingCTABar from 'components/ParticipationCTABars/VotingCTABar';

import { getParticipationMethod } from 'utils/configs/participationMethodConfig';

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

  if (!project || !phases) {
    return null;
  }

  const CTABar: { [method in ParticipationMethod]: JSX.Element | null } = {
    ideation: <IdeationCTABar project={project.data} phases={phases.data} />,
    proposals: <IdeationCTABar project={project.data} phases={phases.data} />,
    native_survey: (
      <NativeSurveyCTABar project={project.data} phases={phases.data} />
    ),
    information: <EventsCTABar project={project.data} phases={phases.data} />,
    survey: (
      <EmbeddedSurveyCTABar project={project.data} phases={phases.data} />
    ),
    voting: <VotingCTABar project={project.data} phases={phases.data} />,
    poll: <PollCTABar project={project.data} phases={phases.data} />,
    volunteering: (
      <VolunteeringCTABar project={project.data} phases={phases.data} />
    ),
    document_annotation: (
      <DocumentAnnotationCTABar project={project.data} phases={phases.data} />
    ),
  };

  const participationMethod = getParticipationMethod(project.data, phases.data);
  const Bar = participationMethod ? CTABar[participationMethod] : null;

  if (isSticky && Bar && portalElement) {
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
          {Bar}
        </Box>
      ) : (
        <Box top="0px" {...sharedProps}>
          <Box height="78px">
            <MainHeader />
          </Box>
          {Bar}
        </Box>
      ),
      portalElement
    );
  }

  return <>{Bar}</>;
};

export default ProjectCTABar;
