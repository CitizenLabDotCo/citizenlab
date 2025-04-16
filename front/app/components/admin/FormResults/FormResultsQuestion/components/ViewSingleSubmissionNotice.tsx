import React from 'react';

import { Box, colors, Icon, Text } from '@citizenlab/cl2-component-library';
import { stringify } from 'qs';
import { useParams } from 'react-router-dom';

import useAddAnalysis from 'api/analyses/useAddAnalysis';
import useAnalyses from 'api/analyses/useAnalyses';
import useUpdateAnalysis from 'api/analyses/useUpdateAnalysis';
import useCustomFields from 'api/custom_fields/useCustomFields';

import Button from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import messages from './messages';

const ViewSingleSubmissionNotice = () => {
  const { formatMessage } = useIntl();

  const { mutate: addAnalysis, isLoading: isAddLoading } = useAddAnalysis();
  const { mutate: updateAnalysis, isLoading: isUpdateLoading } =
    useUpdateAnalysis();

  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId: string;
  };

  const { data: analyses } = useAnalyses({
    projectId: phaseId ? undefined : projectId,
    phaseId,
  });
  const { data: inputCustomFields } = useCustomFields({
    projectId,
    phaseId,
  });

  const inputCustomFieldsIds = inputCustomFields?.map(
    (customField) => customField.id
  );

  const relevantAnalysis = analyses?.data.find(
    (analysis) => analysis.relationships.main_custom_field?.data === null
  );

  const analysisCustomFieldIds =
    relevantAnalysis?.relationships.additional_custom_fields?.data.map(
      (field) => field.id
    ) || [];

  const customFieldsMatchAnalysisAdditionalFields =
    inputCustomFieldsIds &&
    analysisCustomFieldIds.length === inputCustomFieldsIds.length &&
    analysisCustomFieldIds.every((id) => inputCustomFieldsIds.includes(id));

  const openAnalysis = (analysisId: string) => {
    clHistory.push(
      `/admin/projects/${projectId}/analysis/${analysisId}?${stringify({
        phase_id: phaseId,
      })}`
    );
  };

  const goToAnalysis = () => {
    if (relevantAnalysis?.id) {
      if (!customFieldsMatchAnalysisAdditionalFields) {
        updateAnalysis(
          {
            additional_custom_field_ids: inputCustomFieldsIds,
            id: relevantAnalysis.id,
          },
          {
            onSuccess: () => {
              openAnalysis(relevantAnalysis.id);
            },
          }
        );
      } else {
        openAnalysis(relevantAnalysis.id);
      }
    } else {
      addAnalysis(
        {
          projectId: phaseId ? undefined : projectId,
          phaseId,
          additionalCustomFields: inputCustomFieldsIds,
        },
        {
          onSuccess: (response) => openAnalysis(response.data.id),
        }
      );
    }
  };

  return (
    <Box
      display="flex"
      width="720px"
      border={`1px solid ${colors.primary}`}
      p="12px"
      mb="16px"
    >
      <Icon
        width="32px"
        height="32px"
        mr="12px"
        my="auto"
        name="info-outline"
        fill={colors.primary}
      />
      <Box display="flex" gap="16px">
        <Text color="primary" fontSize="s" m="0px" mt="4px">
          {formatMessage(messages.viewIndividualSubmissions)}
        </Text>
        <Button
          onClick={goToAnalysis}
          fontSize="14px"
          buttonStyle="admin-dark-outlined"
          processing={isAddLoading || isUpdateLoading}
        >
          {formatMessage(messages.aiAnalysis)}
        </Button>
      </Box>
    </Box>
  );
};

export default ViewSingleSubmissionNotice;
