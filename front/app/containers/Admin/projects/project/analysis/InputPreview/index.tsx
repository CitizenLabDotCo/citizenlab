import React from 'react';
import { useParams } from 'react-router-dom';
import { Box, Text } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';

import useAnalysis from 'api/analyses/useAnalysis';
import useAnalysisInput from 'api/analysis_inputs/useAnalysisInput';

import Divider from 'components/admin/Divider';
import Taggings from '../Taggings';
import LongFieldValue from './LongFieldValue';
import Avatar from 'components/Avatar';
import useAnalysisUserById from 'api/analysis_users/useAnalysisUserById';
import { getFullName } from 'utils/textUtils';
import { useSelectedInputContext } from '../SelectedInputContext';
import { useIntl } from 'utils/cl-intl';
import translations from './translations';

const InputListItem = () => {
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

  return (
    <Box>
      {analysis.data.attributes.participation_method === 'ideation' && (
        <Box display="flex" justifyContent="flex-end">
          <Button
            linkTo={`/admin/projects/${analysis.data.relationships.project?.data?.id}/ideas?selected_idea_id=${selectedInputId}`}
            openLinkInNewTab
            buttonStyle="secondary"
            icon="settings"
            size="s"
            padding="4px 8px"
          >
            {formatMessage(translations.manageIdea)}
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
