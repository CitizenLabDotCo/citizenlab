import React from 'react';

import {
  Box,
  Text,
  Divider,
  colors,
  fontSizes,
} from '@citizenlab/cl2-component-library';

import { IAnalysis } from 'api/analyses/types';
import useUpdateAnalysis from 'api/analyses/useUpdateAnalysis';
import { IInput } from 'api/analysis_inputs/types';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';

import tracks from '../../../tracks';
import messages from '../../messages';

import LongFieldValue from './LongFieldValue';

interface Props {
  analysis: IAnalysis;
  input: IInput;
  showAllQuestions: boolean;
}

const CustomFields = ({ analysis, input, showAllQuestions }: Props) => {
  const { formatMessage } = useIntl();
  const { mutate: updateAnalysis } = useUpdateAnalysis();

  const mainCustomFieldId =
    analysis.data.relationships.main_custom_field?.data?.id;

  const additionalCustomFieldIds =
    analysis.data.relationships.additional_custom_fields?.data.map(
      (field) => field.id
    );

  const allCustomFields = analysis.data.relationships.all_custom_fields.data;
  const customFieldsInAnalysisIds = [
    mainCustomFieldId,
    ...(additionalCustomFieldIds || []),
  ];

  const handleAddRemoveAdditionalCustomField = (customFieldId: string) => {
    const newAdditionalCustomFieldIds = additionalCustomFieldIds?.includes(
      customFieldId
    )
      ? additionalCustomFieldIds.filter((id) => id !== customFieldId)
      : [...(additionalCustomFieldIds || []), customFieldId];

    updateAnalysis(
      {
        id: analysis.data.id,
        additional_custom_field_ids: newAdditionalCustomFieldIds,
      },
      {
        onSuccess: () => {
          trackEventByName(
            additionalCustomFieldIds?.includes(customFieldId)
              ? tracks.removeQuestionFromAIAnalysis
              : tracks.addQuestionToAIAnalysis
          );
        },
      }
    );
  };

  return (
    <>
      {allCustomFields
        .filter((customField) =>
          showAllQuestions
            ? true
            : customFieldsInAnalysisIds.includes(customField.id)
        )
        .map((customField) => (
          <Box key={customField.id}>
            <Box
              bg={
                customFieldsInAnalysisIds.includes(customField.id) &&
                mainCustomFieldId
                  ? colors.background
                  : colors.white
              }
              px="8px"
              py="16px"
              data-cy="e2e-analysis-custom-field-item"
            >
              {mainCustomFieldId && (
                <Box mb="8px">
                  {customField.id === mainCustomFieldId ? (
                    <Box
                      p="4px 12px"
                      background={colors.primary}
                      w="fit-content"
                      borderRadius="3px"
                    >
                      <Text
                        m="0px"
                        color="white"
                        fontSize="xs"
                        fontWeight="bold"
                      >
                        {formatMessage(messages.mainQuestion).toUpperCase()}
                      </Text>
                    </Box>
                  ) : (
                    <Box display="flex">
                      <ButtonWithLink
                        data-cy={
                          'e2e-analysis-add-remove-additional-custom-field'
                        }
                        onClick={() =>
                          handleAddRemoveAdditionalCustomField(customField.id)
                        }
                        buttonStyle="secondary-outlined"
                        size="s"
                        p="0px 8px"
                        fontSize={`${fontSizes.xs}px`}
                        fontWeight="bold"
                        icon={
                          additionalCustomFieldIds?.includes(customField.id)
                            ? 'close'
                            : 'plus'
                        }
                        iconSize="16px"
                      >
                        {additionalCustomFieldIds?.includes(customField.id)
                          ? formatMessage(messages.remove).toUpperCase()
                          : formatMessage(messages.addToAnalysis).toUpperCase()}
                      </ButtonWithLink>
                    </Box>
                  )}
                </Box>
              )}
              <LongFieldValue
                customFieldId={customField.id}
                input={input.data}
                projectId={analysis.data.relationships.project?.data?.id}
                phaseId={analysis.data.relationships.phase?.data?.id}
              />
            </Box>
            {mainCustomFieldId && <Divider m="0px" />}
          </Box>
        ))}
    </>
  );
};

export default CustomFields;
