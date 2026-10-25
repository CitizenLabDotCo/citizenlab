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

import {
  getMethodConfig,
  getParticipationMethod,
} from 'utils/configs/participationMethodConfig';
import { getPhasePreview } from 'utils/phasePreview/runtime';

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

  const participationMethod = project
    ? getParticipationMethod(
        project.data,
        phases?.data,
        getPhasePreview()?.phase.id
      )
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
  const verticalPositionProps: BoxProps = getPhasePreview()
    ? { position: 'fixed', bottom: '0px' }
    : getVerticalPositionProps({ isSmallerThanTablet, windowHeight });

  return (
    <Box className={className} {...sharedProps} {...verticalPositionProps}>
      {getPhasePreview()?.unsaved ? (
        <fieldset
          disabled
          style={{ border: 0, margin: 0, padding: 0, minWidth: 0 }}
        >
          {BarContents}
        </fieldset>
      ) : (
        BarContents
      )}
    </Box>
  );
};

export default ProjectCTABar;
