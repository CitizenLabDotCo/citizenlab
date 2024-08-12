import React, { useEffect } from 'react';

import { Box, colors, Icon, Text } from '@citizenlab/cl2-component-library';
import { stringify } from 'qs';
import { useParams } from 'react-router-dom';

import useAddAnalysis from 'api/analyses/useAddAnalysis';
import useAnalyses from 'api/analyses/useAnalyses';

import Button from 'components/UI/Button';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import messages from './messages';

const ViewSingleSubmissionNotice = ({
  customFieldId,
  textResponsesCount,
}: {
  customFieldId: string;
  textResponsesCount: number;
}) => {
  const { formatMessage } = useIntl();

  const { mutate: addAnalysis } = useAddAnalysis();

  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId: string;
  };

  const { data: analyses } = useAnalyses({
    projectId: phaseId ? undefined : projectId,
    phaseId,
  });

  const relevantAnalysis =
    analyses?.data &&
    analyses?.data?.find(
      (analysis) =>
        analysis.relationships.main_custom_field?.data?.id === customFieldId
    );

  // Create an analysis if there are no analyses yet
  useEffect(() => {
    if (
      analyses &&
      customFieldId &&
      !relevantAnalysis &&
      textResponsesCount > 10
    ) {
      addAnalysis({
        projectId: phaseId ? undefined : projectId,
        phaseId,
        mainCustomField: customFieldId,
      });
    }
  }, [
    customFieldId,
    relevantAnalysis,
    analyses,
    projectId,
    phaseId,
    addAnalysis,
    textResponsesCount,
  ]);

  const goToAnalysis = () => {
    if (relevantAnalysis?.id) {
      clHistory.push(
        `/admin/projects/${projectId}/analysis/${
          relevantAnalysis.id
        }?${stringify({
          phase_id: phaseId,
        })}`
      );
    } else {
      addAnalysis(
        {
          projectId: phaseId ? undefined : projectId,
          phaseId,
          mainCustomField: customFieldId,
        },
        {
          onSuccess: (response) => {
            clHistory.push(
              `/admin/projects/${projectId}/analysis/${
                response.data.id
              }?${stringify({ phase_id: phaseId })}`
            );
          },
        }
      );
    }
  };

  return (
    <Box position="relative">
      <Box
        display="flex"
        width="720px"
        border={`1px solid ${colors.grey700}`}
        p="12px"
      >
        <Icon
          width="32px"
          height="32px"
          mr="12px"
          my="auto"
          name="info-outline"
          fill={colors.grey700}
        />
        <Box display="flex" gap="16px">
          <Text color="grey700" fontSize="s" m="0px" mt="4px">
            {formatMessage(messages.viewIndividualSubmissions)}
          </Text>
          <Button
            onClick={goToAnalysis}
            fontSize="14px"
            buttonStyle="secondary-outlined"
          >
            {formatMessage(messages.aiAnalysis)}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ViewSingleSubmissionNotice;
