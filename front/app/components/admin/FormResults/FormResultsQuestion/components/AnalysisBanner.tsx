import React from 'react';

import {
  Box,
  colors,
  Icon,
  stylingConsts,
  Text,
  Tooltip,
} from '@citizenlab/cl2-component-library';
import { stringify } from 'qs';
import { useParams } from 'react-router-dom';

import useAddAnalysis from 'api/analyses/useAddAnalysis';
import useAnalyses from 'api/analyses/useAnalyses';
import useUpdateAnalysis from 'api/analyses/useUpdateAnalysis';
import useRawCustomFields from 'api/custom_fields/useRawCustomFields';

import Button from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import messages from './messages';

const AnalysisBanner = () => {
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
  const { data: inputCustomFields } = useRawCustomFields({
    projectId,
    phaseId,
  });

  // When a survey phase is just initialized, the custom fields endpoint returns
  // custom fields that are generated on the fly by the back-end, which are not
  // persisted yet. In such case, we can't create the analysis, since we can't
  // yet add any custom fields. To detect this scenario, we can check whether
  // the custom fields have the resource relationship set. If their custom_form
  // is already persisted, this is the custom_form, if not, it is
  // null.
  // Not the most elegant fix, also see
  // https://go-vocal.slack.com/archives/C65GX921W/p1744705183425669
  const customFieldArePersisted = inputCustomFields?.data.every(
    (customField) => !!customField.relationships.resource?.data
  );

  const inputCustomFieldsIds = inputCustomFields?.data.map(
    (customField) => customField.id
  );

  // Each context has a 'main' analysis: The one with no main custom field and
  // all custom fields in the additional custom fields.
  const mainAnalysis = analyses?.data.find(
    (analysis) => analysis.relationships.main_custom_field?.data === null
  );

  const analysisCustomFieldIds =
    mainAnalysis?.relationships.additional_custom_fields?.data.map(
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
    if (mainAnalysis?.id) {
      if (!customFieldsMatchAnalysisAdditionalFields) {
        updateAnalysis(
          {
            additional_custom_field_ids: inputCustomFieldsIds,
            id: mainAnalysis.id,
          },
          {
            onSuccess: () => {
              openAnalysis(mainAnalysis.id);
            },
          }
        );
      } else {
        openAnalysis(mainAnalysis.id);
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

      <Tooltip
        disabled={customFieldArePersisted}
        content={formatMessage(messages.customFieldsNotPersisted)}
      >
        <Button
          buttonStyle="text"
          textColor={colors.teal500}
          fontWeight="bold"
          icon="arrow-right"
          iconPos="right"
          iconColor={colors.teal500}
          onClick={goToAnalysis}
          processing={isAddLoading || isUpdateLoading}
          disabled={!customFieldArePersisted}
        >
          {formatMessage(messages.aiAnalysis)}
        </Button>
      </Tooltip>
    </Box>
  );
};

export default AnalysisBanner;
