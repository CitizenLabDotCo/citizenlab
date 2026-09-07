import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

import { IPhaseData } from 'api/phases/types';
import usePhases from 'api/phases/usePhases';
import useProjectById from 'api/projects/useProjectById';

import useLocale from 'hooks/useLocale';

import { useIntl } from 'utils/cl-intl';

import useFitPhonePreview, {
  PHONE_LOGICAL_HEIGHT,
  PHONE_LOGICAL_WIDTH,
  PHONE_PREVIEW_PADDING,
} from '../../../../_shared/useFitPhonePreview';
import messages from '../messages';

interface Props {
  projectId: string;
  phase: IPhaseData;
}

const PhasePreview = ({ projectId, phase }: Props) => {
  const { formatMessage } = useIntl();
  const locale = useLocale();
  const { data: project } = useProjectById(projectId);
  const { data: phases } = usePhases(projectId);
  const { scale, containerRef } = useFitPhonePreview();

  if (!project || !phases) return null;

  // The resident page addresses phases by their position in the timeline, not
  // by id. A detached phase has no position, so it falls back to the project.
  const phaseIndex = phases.data.findIndex(({ id }) => id === phase.id);
  const slug = project.data.attributes.slug;
  const previewSrc =
    phaseIndex === -1
      ? `/${locale}/projects/${slug}`
      : `/${locale}/projects/${slug}/${phaseIndex + 1}`;

  return (
    <Box
      ref={containerRef}
      h="100%"
      display="flex"
      alignItems="center"
      justifyContent="center"
      // The phone scales to whatever room is left, so the stage itself never
      // scrolls.
      overflow="hidden"
      p={`${PHONE_PREVIEW_PADDING}px`}
      background={`radial-gradient(circle at 1px 1px, rgba(0, 0, 0, 0.04) 1px, transparent 0) 0 0 / 18px 18px, ${colors.background}`}
    >
      <Box
        w={`${PHONE_LOGICAL_WIDTH * scale}px`}
        h={`${PHONE_LOGICAL_HEIGHT * scale}px`}
        background={colors.white}
        border={`1.5px solid ${colors.grey300}`}
        borderRadius="22px"
        overflow="hidden"
        boxShadow="0 10px 30px rgba(20, 25, 40, 0.07)"
      >
        <Box
          as="iframe"
          src={previewSrc}
          title={formatMessage(messages.phasePreviewTitle)}
          display="block"
          w={`${PHONE_LOGICAL_WIDTH}px`}
          h={`${PHONE_LOGICAL_HEIGHT}px`}
          border="none"
          transform={`scale(${scale})`}
          style={{ transformOrigin: 'top left' }}
        />
      </Box>
    </Box>
  );
};

export default PhasePreview;
