import React from 'react';

import {
  Icon,
  colors,
  Text,
  Button,
  Box,
  stylingConsts,
} from '@citizenlab/cl2-component-library';

import useAddAnalysis from 'api/analyses/useAddAnalysis';
import useAnalyses from 'api/analyses/useAnalyses';
import usePhase from 'api/phases/usePhase';

import useFeatureFlag from 'hooks/useFeatureFlag';

import tracks from 'containers/Admin/projects/project/analysis/tracks';

import UpsellTooltip from 'components/UpsellTooltip';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import messages from '../../project/ideas/messages';

import { getAnalysisScope } from './utils';

type Props = {
  projectId: string;
  phaseId: string;
};

const AnalysisBanner = ({ projectId, phaseId }: Props) => {
  const { data: phase } = usePhase(phaseId);
  const scope = getAnalysisScope(phase?.data.attributes.participation_method);

  const { data: analyses, isLoading: isLoadingAnalyses } = useAnalyses({
    projectId: scope === 'project' ? projectId : undefined,
    phaseId: scope === 'phase' ? phaseId : undefined,
  });

  const { mutate: createAnalysis, isLoading } = useAddAnalysis();
  const { formatMessage } = useIntl();

  const isAnalysisAllowed = useFeatureFlag({
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
        {
          projectId: scope === 'project' ? projectId : undefined,
          phaseId: scope === 'phase' ? phaseId : undefined,
        },
        {
          onSuccess: (analysis) => {
            clHistory.push(
              `/admin/projects/${
                projectId || phase?.data.relationships.project.data.id
              }/analysis/${analysis.data.id}?phase_id=${phaseId}`
            );
            trackEventByName(tracks.analysisCreated, {
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
          onClick={handleGoToAnalysis}
          fontWeight="bold"
          icon="arrow-right"
          iconPos="right"
          iconColor={colors.teal500}
          id="e2e-analysis-banner-button"
          processing={isLoading}
          disabled={!isAnalysisAllowed}
        >
          {formatMessage(messages.analysisButton)}
        </Button>
      </UpsellTooltip>
    </Box>
  );
};

export default AnalysisBanner;
