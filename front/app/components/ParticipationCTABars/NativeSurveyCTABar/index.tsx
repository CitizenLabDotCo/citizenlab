import React from 'react';

import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';

import useCustomFields from 'api/custom_fields/useCustomFields';
import useAuthUser from 'api/me/useAuthUser';

import IdeaButton from 'components/IdeaButton';
import ParticipationCTAContent from 'components/ParticipationCTABars/ParticipationCTAContent';
import {
  CTABarProps,
  getCTAPhase,
} from 'components/ParticipationCTABars/utils';

import { getIdeaPostingRules } from 'utils/actionTakingRules';
import { usePhasePreview } from 'utils/phasePreview/runtime';

const NativeSurveyCTABar = ({ project, phases }: CTABarProps) => {
  const theme = useTheme();
  const { data: authUser } = useAuthUser();
  const isSmallerThanPhone = useBreakpoint('phone');
  const currentPhase = getCTAPhase(phases);

  const preview = usePhasePreview();
  const { data: fields } = useCustomFields({
    projectId: preview && !preview.unsaved ? project.id : undefined,
    phaseId: preview && !preview.unsaved ? preview.phase.id : undefined,
    publicFields: true,
  });
  const hasQuestions = fields?.some(
    (field) => field.enabled && field.input_type !== 'page'
  );

  const { disabledReason } = getIdeaPostingRules({
    project,
    phase: currentPhase,
    authUser: authUser?.data,
  });
  const hasUserParticipated = disabledReason === 'posting_limited_max_reached';

  if (preview && (!hasQuestions || preview.lifecycle === 'ended')) return null;

  return (
    <ParticipationCTAContent
      currentPhase={currentPhase}
      CTAButton={
        hasUserParticipated ? null : (
          <Box w="100%">
            <IdeaButton
              projectId={project.id}
              fontWeight="500"
              bgColor={theme.colors.white}
              textColor={theme.colors.tenantText}
              iconPos="right"
              icon={!isSmallerThanPhone ? 'arrow-right' : undefined}
              iconColor={theme.colors.tenantText}
              textHoverColor={theme.colors.black}
              iconHoverColor={theme.colors.black}
              phase={currentPhase}
              iconSize="20px"
              padding="6px 12px"
              fontSize="14px"
              participationMethod="native_survey"
            />
          </Box>
        )
      }
      hasUserParticipated={hasUserParticipated}
    />
  );
};

export default NativeSurveyCTABar;
