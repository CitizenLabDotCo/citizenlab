import React, { useState } from 'react';

import { Box, Divider, Text } from '@citizenlab/cl2-component-library';
import { useParams, useSearchParams } from 'react-router-dom';

import useAnalysis from 'api/analyses/useAnalysis';
import useAnalysisInput from 'api/analysis_inputs/useAnalysisInput';
import useAnalysisUserById from 'api/analysis_users/useAnalysisUserById';

import Avatar from 'components/Avatar';
import Button from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';
import { getMethodConfig } from 'utils/configs/participationMethodConfig';
import { getFullName } from 'utils/textUtils';

import { useSelectedInputContext } from '../SelectedInputContext';
import Taggings from '../Taggings';

import Comments from './components/Comments';
import CustomFields from './components/CustomFields';
import messages from './messages';

const InputListItem = () => {
  const { projectId } = useParams() as { projectId: string };
  const [showAllQuestions, setShowAllQuestions] = useState(false);
  const [searchParams] = useSearchParams();

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
  const showAuthor =
    authorId && author?.data.attributes.first_name && !isRefetchingAuthor;

  if (!analysis || !input || !selectedInputId) return null;

  const methodConfig = getMethodConfig(
    analysis.data.attributes.participation_method
  );
  const showManageInputButton = methodConfig.showInputManager && phaseId;

  const mainCustomFieldId =
    analysis.data.relationships.main_custom_field?.data?.id;

  const allCustomFields = analysis.data.relationships.all_custom_fields.data;
  return (
    <Box data-cy="e2e-analysis-input-preview">
      {showManageInputButton && (
        <Box display="flex" justifyContent="flex-end">
          <Button
            linkTo={`/admin/projects/${projectId}/phases/${phaseId}/ideas?selected_idea_id=${selectedInputId}`}
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

      <CustomFields
        analysis={analysis}
        input={input}
        showAllQuestions={showAllQuestions}
      />

      <Box id="tags-control" my="12px">
        <Taggings onlyShowTagged={false} inputId={selectedInputId} />
      </Box>

      {methodConfig.supportsComments && <Comments />}
    </Box>
  );
};

export default InputListItem;
