import React from 'react';

import {
  Icon,
  colors,
  Text,
  Button,
  Box,
  stylingConsts,
  Tooltip,
} from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import useAddAnalysis from 'api/analyses/useAddAnalysis';
import useAnalyses from 'api/analyses/useAnalyses';

import useFeatureFlag from 'hooks/useFeatureFlag';

import tracks from 'containers/Admin/projects/project/analysis/tracks';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import messages from './messages';

const AnalysisBanner = () => {
  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId: string;
  };

  const { data: analyses, isLoading: isLoadingAnalyses } = useAnalyses({
    projectId,
  });

  const { mutate: createAnalysis, isLoading } = useAddAnalysis();
  const { formatMessage } = useIntl();

  const isAnalysisEnabled = useFeatureFlag({
    name: 'analysis',
    onlyCheckAllowed: true,
  });

  const handleGoToAnalysis = () => {
    if (analyses?.data.length) {
      clHistory.push(
        `/admin/projects/${projectId}/analysis/${analyses?.data[0].id}?phase_id=${phaseId}`
      );
    } else {
      createAnalysis(
        { projectId },
        {
          onSuccess: (analysis) => {
            clHistory.push(
              `/admin/projects/${projectId}/analysis/${analysis.data.id}`
            );
            trackEventByName(tracks.analysisForIdeationCreated.name, {
              extra: { projectId },
            });
          },
        }
      );
    }
  };

  if (isLoadingAnalyses) return null;

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      borderRadius={stylingConsts.borderRadius}
      p="8px 16px"
      mb="24px"
      bgColor={colors.errorLight}
    >
      <Box display="flex" gap="16px" alignItems="center">
        <Icon name="stars" width="50px" height="50px" fill={colors.orange500} />
        <Text fontWeight="bold">
          {formatMessage(messages.analysisSubtitle)}
        </Text>
      </Box>
      <Tooltip
        content={<p>{formatMessage(messages.analysisUpsellTooltip)}</p>}
        disabled={isAnalysisEnabled}
      >
        <Box>
          <Button
            buttonStyle="text"
            textColor={colors.orange500}
            onClick={handleGoToAnalysis}
            fontWeight="bold"
            icon={isAnalysisEnabled ? 'stars' : 'lock'}
            iconColor={colors.orange500}
            id="e2e-analysis-banner-button"
            processing={isLoading}
            disabled={!isAnalysisEnabled}
          >
            {formatMessage(messages.analysisButton)}
          </Button>
        </Box>
      </Tooltip>
    </Box>
  );
};

export default AnalysisBanner;
