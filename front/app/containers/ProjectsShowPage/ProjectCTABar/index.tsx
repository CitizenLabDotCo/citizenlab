import React from 'react';

import {
  Box,
  BoxProps,
  colors,
  useBreakpoint,
  useWindowSize,
} from '@citizenlab/cl2-component-library';

import usePhases from 'api/phases/usePhases';
import useProjectById from 'api/projects/useProjectById';

import DisabledFieldset from 'components/admin/PhasePreview/DisabledFieldset';

import {
  getMethodConfig,
  getParticipationMethod,
} from 'utils/configs/participationMethodConfig';
import { usePhasePreview } from 'utils/phasePreview/runtime';

import { getVerticalPositionProps } from './utils';

type ProjectCTABarProps = {
  projectId: string;
  className?: string;
};

const ProjectCTABar = ({ projectId, className }: ProjectCTABarProps) => {
  const isSmallerThanTablet = useBreakpoint('tablet');
  const { windowHeight } = useWindowSize();

  const { data: phases } = usePhases(projectId);
  const { data: project } = useProjectById(projectId);
  const preview = usePhasePreview();

  const participationMethod = project
    ? getParticipationMethod(project.data, phases?.data, preview?.phase.id)
    : undefined;

  if (
    !project ||
    !participationMethod ||
    project.data.attributes.publication_status === 'archived'
  ) {
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
  const verticalPositionProps: BoxProps = preview
    ? { position: 'fixed', bottom: '0px' }
    : getVerticalPositionProps({ isSmallerThanTablet, windowHeight });

  return (
    <Box className={className} {...sharedProps} {...verticalPositionProps}>
      {preview?.unsaved ? (
        <DisabledFieldset>{BarContents}</DisabledFieldset>
      ) : (
        BarContents
      )}
    </Box>
  );
};

export default ProjectCTABar;
