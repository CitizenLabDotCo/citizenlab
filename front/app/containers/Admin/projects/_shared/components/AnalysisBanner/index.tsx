import React from 'react';

import {
  Icon,
  colors,
  Text,
  Button,
  Box,
  stylingConsts,
} from '@citizenlab/cl2-component-library';

import useFeatureFlag from 'hooks/useFeatureFlag';

import messages from 'containers/Admin/projects/project/ideas/messages';

import UpsellTooltip from 'components/UpsellTooltip';

import { useIntl } from 'utils/cl-intl';

import useGoToAnalysis from './useGoToAnalysis';

type Props = {
  projectId: string;
  phaseId: string;
};

const AnalysisBanner = ({ projectId, phaseId }: Props) => {
  const { goToAnalysis, isLoading, isPending } = useGoToAnalysis(
    projectId,
    phaseId
  );
  const { formatMessage } = useIntl();

  const isAnalysisAllowed = useFeatureFlag({
    name: 'analysis',
    onlyCheckAllowed: true,
  });

  if (isLoading) return null;

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      borderRadius={stylingConsts.borderRadius}
      p="8px 16px"
      mb="24px"
      bgColor={colors.teal100}
    >
      <Box display="flex" gap="16px" alignItems="center">
        <Icon name="stars" width="30px" height="30px" fill={colors.teal500} />
        <Text>{formatMessage(messages.analysisSubtitle)}</Text>
      </Box>
      <UpsellTooltip disabled={isAnalysisAllowed}>
        <Button
          buttonStyle="text"
          textColor={colors.teal500}
          onClick={goToAnalysis}
          fontWeight="bold"
          icon="arrow-right"
          iconPos="right"
          iconColor={colors.teal500}
          id="e2e-analysis-banner-button"
          processing={isPending}
          disabled={!isAnalysisAllowed}
        >
          {formatMessage(messages.analysisButton)}
        </Button>
      </UpsellTooltip>
    </Box>
  );
};

export default AnalysisBanner;
