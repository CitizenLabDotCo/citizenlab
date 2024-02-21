import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Box, Text } from '@citizenlab/cl2-component-library';
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

  const mainCustomFieldId =
    analysis.data.relationships?.main_custom_field?.data.id;
  const additionalCustomFieldIds =
    analysis.data.relationships?.additional_custom_fields?.data.map(
      (field) => field.id
    );

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
      {authorId && author && !isRefetchingAuthor && (
        <Box mt="20px" display="flex" alignItems="center">
          <Avatar size={40} userId={author.data.id} />
          <Text m="0px">{getFullName(author?.data)}</Text>
          <Divider />
        </Box>
      )}

      {analysis.data.relationships.all_custom_fields.data.map((customField) => (
        <Box key={customField.id}>
          {customField.id === mainCustomFieldId && <Box>Main question</Box>}
          <Button
            onClick={() => handleAddRemoveAdditionalCustomField(customField.id)}
            buttonStyle="secondary"
          >
            {additionalCustomFieldIds?.includes(customField.id)
              ? 'Remove'
              : 'Add'}
          </Button>
          <LongFieldValue
            customFieldId={customField.id}
            input={input.data}
            projectId={analysis.data.relationships.project?.data?.id}
            phaseId={analysis.data.relationships.phase?.data?.id}
          />
        </Box>
      ))}

      <Box id="tags-control" mb="12px">
        <Divider />
        <Taggings onlyShowTagged={false} inputId={selectedInputId} />
      </Box>
    </Box>
  );
};

export default InputListItem;
