import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import { useParams, useSearchParams } from 'react-router-dom';

import Divider from 'components/admin/Divider';
import Avatar from 'components/Avatar';
import Button from 'components/UI/Button';

import { useIntl } from 'utils/cl-intl';
import { getFullName } from 'utils/textUtils';

import useAnalysis from 'api/analyses/useAnalysis';
import useAnalysisInput from 'api/analysis_inputs/useAnalysisInput';
import useAnalysisUserById from 'api/analysis_users/useAnalysisUserById';

import { useSelectedInputContext } from '../SelectedInputContext';
import Taggings from '../Taggings';

import LongFieldValue from './LongFieldValue';
import messages from './messages';

const InputListItem = () => {
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

  if (!analysis || !input || !selectedInputId) return null;

  const showManageIdeaButton =
    analysis.data.attributes.participation_method === 'ideation' && phaseId;

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
      {analysis.data.relationships.custom_fields.data.map((customField) => (
        <LongFieldValue
          key={customField.id}
          customFieldId={customField.id}
          input={input.data}
          projectId={analysis.data.relationships.project?.data?.id}
          phaseId={analysis.data.relationships.phase?.data?.id}
        />
      ))}
      {authorId && author && !isRefetchingAuthor && (
        <Box mt="20px" display="flex" alignItems="center">
          <Avatar size={40} userId={author.data.id} />
          <Text m="0px">{getFullName(author?.data)}</Text>
        </Box>
      )}
      <Divider />
      <Box id="tags-control">
        <Taggings onlyShowTagged={false} inputId={selectedInputId} />
      </Box>
    </Box>
  );
};

export default InputListItem;
