import React, { useState } from 'react';

import {
  Box,
  Divider,
  Text,
  colors,
  fontSizes,
} from '@citizenlab/cl2-component-library';
import { useParams, useSearchParams } from 'react-router-dom';

import useAnalysis from 'api/analyses/useAnalysis';
import useUpdateAnalysis from 'api/analyses/useUpdateAnalysis';
import useAnalysisInput from 'api/analysis_inputs/useAnalysisInput';
import useAnalysisUserById from 'api/analysis_users/useAnalysisUserById';
import usePhase from 'api/phases/usePhase';

import Avatar from 'components/Avatar';
import Button from 'components/UI/Button';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';
import { getMethodConfig } from 'utils/configs/participationMethodConfig';
import { getFullName } from 'utils/textUtils';

import { useSelectedInputContext } from '../SelectedInputContext';
import Taggings from '../Taggings';
import tracks from '../tracks';

import LongFieldValue from './LongFieldValue';
import messages from './messages';

const InputListItem = () => {
  const [showAllQuestions, setShowAllQuestions] = useState(false);
  const [searchParams] = useSearchParams();
  const { mutate: updateAnalysis } = useUpdateAnalysis();

  const phaseId = searchParams.get('phase_id');
  const { data: phase } = usePhase(phaseId);
  const { formatMessage } = useIntl();
  const { selectedInputId } = useSelectedInputContext();
  const { analysisId } = useParams() as { analysisId: string };
  const { data: input } = useAnalysisInput(
    analysisId,
    selectedInputId ?? undefined
  );
  const { data: analysis } = useAnalysis(analysisId);

  const authorId = input?.data.relationships.author.data?.id;
  const { data: author, isRefetching: isRefetchingAuthor } =
    useAnalysisUserById({
      id: authorId ?? null,
      analysisId,
    });
  const showAuthor =
    authorId && author?.data.attributes.first_name && !isRefetchingAuthor;

  if (!analysis || !input || !selectedInputId) return null;

  const methodConfig = getMethodConfig(
    analysis.data.attributes.participation_method
  );
  const showManageInputButton = methodConfig.showInputManager && phaseId;

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
        id: analysisId,
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
    <Box data-cy="e2e-analysis-input-preview">
      {showManageInputButton && (
        <Box display="flex" justifyContent="flex-end">
          <Button
            linkTo={`/admin/projects/${phase?.data.relationships.project.data.id}/phases/${phaseId}/ideas?selected_idea_id=${selectedInputId}`}
            openLinkInNewTab
            buttonStyle="secondary-outlined"
            icon="settings"
            size="s"
            padding="4px 8px"
          >
            {formatMessage(messages.manageInput)}
          </Button>
        </Box>
      )}
      {mainCustomFieldId && (
        <Button
          id="e2e-analysis-toggle-show-all-questions-button"
          onClick={() =>
            setShowAllQuestions((showAllQuestions) => !showAllQuestions)
          }
          buttonStyle="secondary-outlined"
          size="s"
          icon={showAllQuestions ? 'minus' : 'plus'}
          mb="20px"
        >
          {showAllQuestions
            ? formatMessage(messages.viewSelectedQuestions)
            : `${formatMessage(messages.viewAllQuestions)} (${
                allCustomFields.length
              })`}
        </Button>
      )}
      {showAuthor && (
        <Box mt="20px" display="flex" alignItems="center">
          <Avatar size={40} userId={author.data.id} />
          <Text m="0px">{getFullName(author.data)}</Text>
          <Divider />
        </Box>
      )}

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
                      <Button
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
                      </Button>
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

      <Box id="tags-control" my="12px">
        <Taggings onlyShowTagged={false} inputId={selectedInputId} />
      </Box>
    </Box>
  );
};

export default InputListItem;
