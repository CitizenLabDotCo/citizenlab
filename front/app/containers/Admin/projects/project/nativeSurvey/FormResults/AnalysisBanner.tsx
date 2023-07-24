import React, { useEffect } from 'react';

import {
  Icon,
  colors,
  Text,
  Button,
  Title,
  Box,
} from '@citizenlab/cl2-component-library';
import { useIntl } from 'utils/cl-intl';
import messages from './messages';
import { useParams, useSearchParams } from 'react-router-dom';
import clHistory from 'utils/cl-router/history';
import useAnalyses from 'api/analyses/useAnalyses';
import useAddAnalysis from 'api/analyses/useAddAnalysis';
import useFormCustomFields from 'hooks/useFormCustomFields';

const AnalysisBanner = () => {
  const { projectId } = useParams() as { projectId: string };
  const { data: analyses } = useAnalyses({ projectId });
  const { mutate: createAnalysis } = useAddAnalysis();

  const [urlParams] = useSearchParams();
  const phaseId = urlParams.get('phase_id') || undefined;
  const formCustomFields = useFormCustomFields({
    projectId,
    phaseId,
  });

  console.log(formCustomFields);
  const { formatMessage } = useIntl();

  useEffect(() => {
    if (analyses && analyses.data.length === 0) {
      createAnalysis({ projectId });
    }
  }, [analyses, createAnalysis, projectId]);

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      borderColor={colors.borderLight}
      borderRadius="3px"
      borderWidth="1px"
      borderStyle="solid"
      p="8px 16px"
      mb="36px"
    >
      <Box display="flex" gap="16px" alignItems="center">
        <Icon name="flash" width="50px" height="50px" fill={colors.orange} />
        <Box>
          <Title variant="h3">{formatMessage(messages.analysisTitle)}</Title>
          <Text>{formatMessage(messages.analysisSubtitle)}</Text>
        </Box>
      </Box>
      <Button
        buttonStyle="admin-dark"
        onClick={() => {
          clHistory.push(
            `/admin/projects/${projectId}/analysis/${analyses?.data[0].id}`
          );
        }}
      >
        {formatMessage(messages.analysisButton)}
      </Button>
    </Box>
  );
};

export default AnalysisBanner;
