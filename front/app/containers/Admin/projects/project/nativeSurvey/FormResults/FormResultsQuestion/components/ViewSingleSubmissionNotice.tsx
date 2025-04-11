import React from 'react';

import {
  Box,
  colors,
  Icon,
  stylingConsts,
  Text,
} from '@citizenlab/cl2-component-library';
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
      justifyContent="space-between"
      alignItems="center"
      borderRadius={stylingConsts.borderRadius}
      p="8px 16px"
      mb="24px"
      bgColor={colors.teal100}
    >
      <Box display="flex" gap="16px" alignItems="center">
        <Icon name="stars" width="30px" height="30px" fill={colors.teal500} />
        <Text>{formatMessage(messages.viewIndividualSubmissions)}</Text>
      </Box>

      <Button
        buttonStyle="text"
        textColor={colors.teal500}
        fontWeight="bold"
        icon={'stars'}
        iconColor={colors.teal500}
        onClick={goToAnalysis}
        processing={isAddLoading || isUpdateLoading}
      >
        {formatMessage(messages.aiAnalysis)}
      </Button>
    </Box>
  );
};

export default ViewSingleSubmissionNotice;
