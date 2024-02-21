import React, { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  Box,
  Text,
  colors,
  fontSizes,
} from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';

import useAnalysis from 'api/analyses/useAnalysis';
import useAnalysisInput from 'api/analysis_inputs/useAnalysisInput';
import useUpdateAnalysis from 'api/analyses/useUpdateAnalysis';

import Divider from 'components/admin/Divider';
import Taggings from '../Taggings';
import LongFieldValue from './LongFieldValue';
import Avatar from 'components/Avatar';
import useAnalysisUserById from 'api/analysis_users/useAnalysisUserById';
import { getFullName } from 'utils/textUtils';
import { useSelectedInputContext } from '../SelectedInputContext';
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

const InputListItem = () => {
  const [showAllQuestions, setShowAllQuestions] = useState(false);
  const [searchParams] = useSearchParams();
  const { mutate: updateAnalysis } = useUpdateAnalysis();

  const phaseId = searchParams.get('phase_id');
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

  if (!analysis || !input || !selectedInputId) return null;

  const showManageIdeaButton =
    analysis.data.attributes.participation_method === 'ideation' && phaseId;

  const isSurveyAnalysis =
    analysis.data.attributes.participation_method === 'native_survey';

  const mainCustomFieldId =
    analysis.data.relationships?.main_custom_field?.data.id;

  const additionalCustomFieldIds =
    analysis.data.relationships?.additional_custom_fields?.data.map(
      (field) => field.id
    );

  const customFieldsInAnalysisIds =
    [mainCustomFieldId, ...(additionalCustomFieldIds || [])] || [];

  const handleAddRemoveAdditionalCustomField = (customFieldId: string) => {
    const newAdditionalCustomFieldIds = additionalCustomFieldIds?.includes(
      customFieldId
    )
      ? additionalCustomFieldIds.filter((id) => id !== customFieldId)
      : [...(additionalCustomFieldIds || []), customFieldId];

    updateAnalysis({
      id: analysisId,
      additional_custom_field_ids: newAdditionalCustomFieldIds,
    });
  };

  return (
    <Box data-cy="e2e-analysis-input-preview">
      {showManageIdeaButton && (
        <Box display="flex" justifyContent="flex-end">
          <Button
            linkTo={`/admin/projects/${analysis.data.relationships.project?.data?.id}/phases/${phaseId}/ideas?selected_idea_id=${selectedInputId}`}
            openLinkInNewTab
            buttonStyle="secondary"
            icon="settings"
            size="s"
            padding="4px 8px"
          >
            {formatMessage(messages.manageIdea)}
          </Button>
        </Box>
      )}
      {isSurveyAnalysis && (
        <Button
          onClick={() =>
            setShowAllQuestions((showAllQuestions) => !showAllQuestions)
          }
          buttonStyle="secondary"
          size="s"
          icon={showAllQuestions ? 'minus' : 'plus'}
          mb="20px"
        >
          {showAllQuestions
            ? 'View only selected questions'
            : 'View all questions'}
        </Button>
      )}
      {authorId && author && !isRefetchingAuthor && (
        <Box mt="20px" display="flex" alignItems="center">
          <Avatar size={40} userId={author.data.id} />
          <Text m="0px">{getFullName(author?.data)}</Text>
          <Divider />
        </Box>
      )}

      {analysis.data.relationships.all_custom_fields.data
        .filter((customField) =>
          !isSurveyAnalysis || showAllQuestions
            ? true
            : customFieldsInAnalysisIds.includes(customField.id)
        )
        .map((customField) => (
          <>
            <Box
              key={customField.id}
              bg={
                customFieldsInAnalysisIds.includes(customField.id)
                  ? colors.background
                  : colors.white
              }
              px="8px"
              py="16px"
            >
              {isSurveyAnalysis && (
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
                        MAIN QUESTION
                      </Text>
                    </Box>
                  ) : (
                    <Box display="flex">
                      <Button
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
                          ? 'REMOVE'
                          : 'ADD TO ANALYSIS'}
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
            <Divider m="0px" />
          </>
        ))}

      <Box id="tags-control" mb="12px">
        <Divider />
        <Taggings onlyShowTagged={false} inputId={selectedInputId} />
      </Box>
    </Box>
  );
};

export default InputListItem;
