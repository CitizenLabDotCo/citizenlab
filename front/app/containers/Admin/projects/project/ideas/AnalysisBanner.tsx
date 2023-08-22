import React from 'react';
import useFeatureFlag from 'hooks/useFeatureFlag';

import {
  Icon,
  colors,
  Text,
  Button,
  Box,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import { useIntl } from 'utils/cl-intl';
import messages from './messages';
import { useParams } from 'react-router-dom';
import clHistory from 'utils/cl-router/history';
import useAnalyses from 'api/analyses/useAnalyses';
import useAddAnalysis from 'api/analyses/useAddAnalysis';

const AnalysisBanner = () => {
  const { projectId } = useParams() as { projectId: string };
  const { data: analyses, isLoading: isLoadingAnalyses } = useAnalyses({
    projectId,
  });
  const { mutate: createAnalysis, isLoading } = useAddAnalysis();

  const { formatMessage } = useIntl();

  const analysisEnabled = useFeatureFlag({ name: 'analysis' });

  const handleGoToAnalysis = () => {
    if (analyses?.data.length) {
      clHistory.push(
        `/admin/projects/${projectId}/analysis/${analyses?.data[0].id}`
      );
    } else {
      createAnalysis(
        { projectId },
        {
          onSuccess: (analysis) => {
            clHistory.push(
              `/admin/projects/${projectId}/analysis/${analysis.data.id}?showLaunchModal=true`
            );
          },
        }
      );
    }
  };

  if (!analysisEnabled || isLoadingAnalyses) return null;

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      borderRadius={stylingConsts.borderRadius}
      p="8px 16px"
      mb="36px"
      bgColor={colors.errorLight}
    >
      <Box display="flex" gap="16px" alignItems="center">
        <Icon name="flash" width="50px" height="50px" fill={colors.orange} />
        <Text fontWeight="bold">
          {formatMessage(messages.analysisSubtitle)}
        </Text>
      </Box>
      <Button
        buttonStyle="text"
        textColor={colors.orange}
        onClick={handleGoToAnalysis}
        processing={isLoading}
        fontWeight="bold"
        icon="flash"
        iconColor={colors.orange}
      >
        {formatMessage(messages.analysisButton)}
      </Button>
    </Box>
  );
};

export default AnalysisBanner;
