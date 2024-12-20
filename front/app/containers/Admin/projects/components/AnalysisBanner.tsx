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

import useAddAnalysis from 'api/analyses/useAddAnalysis';
import useAnalyses from 'api/analyses/useAnalyses';
import usePhase from 'api/phases/usePhase';

import useFeatureFlag from 'hooks/useFeatureFlag';

import tracks from 'containers/Admin/projects/project/analysis/tracks';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import messages from '../project/ideas/messages';

type Props =
  | {
      projectId: string;
      phaseId?: never;
    }
  | {
      projectId?: never;
      phaseId: string;
    };

/** For ideation, the analysis is scoped on the project level, for the other
 * methods, it's scoped on the phase level. Pass the right prop, either the one
 * or the other */
const AnalysisBanner = ({ projectId, phaseId }: Props) => {
  const { data: analyses, isLoading: isLoadingAnalyses } = useAnalyses({
    projectId,
    phaseId,
  });

  const { data: phase } = usePhase(phaseId);

  const { mutate: createAnalysis, isLoading } = useAddAnalysis();
  const { formatMessage } = useIntl();

  const isAnalysisEnabled = useFeatureFlag({
    name: 'analysis',
    onlyCheckAllowed: true,
  });

  const handleGoToAnalysis = () => {
    if (analyses?.data.length) {
      clHistory.push(
        `/admin/projects/${
          projectId || phase?.data.relationships.project.data.id
        }/analysis/${analyses.data[0].id}?phase_id=${phaseId}`
      );
    } else {
      createAnalysis(
        { projectId, phaseId },
        {
          onSuccess: (analysis) => {
            clHistory.push(
              `/admin/projects/${
                projectId || phase?.data.relationships.project.data.id
              }/analysis/${analysis.data.id}`
            );
            trackEventByName(tracks.analysisCreated.name, {
              projectId,
              phaseId,
              participationMethod:
                phase?.data.attributes.participation_method || 'ideation',
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
