import React from 'react';
import { useParams } from 'react-router-dom';
import { Box, Text } from '@citizenlab/cl2-component-library';

import useAnalysis from 'api/analyses/useAnalysis';
import useAnalysisInput from 'api/analysis_inputs/useAnalysisInput';

import Divider from 'components/admin/Divider';
import Taggings from '../Taggings';
import LongFieldValue from './LongFieldValue';
import Avatar from 'components/Avatar';
import useUserById from 'api/users/useUserById';
import { getFullName } from 'utils/textUtils';

interface Props {
  inputId: string;
}

const InputListItem = ({ inputId }: Props) => {
  const { analysisId } = useParams() as { analysisId: string };
  const { data: input } = useAnalysisInput(analysisId, inputId);
  const { data: analysis } = useAnalysis(analysisId);
  const { data: author } = useUserById(
    input?.data.relationships.author.data?.id
  );

  if (!analysis || !input) return null;

  return (
    <Box>
      {analysis.data.relationships.custom_fields.data.map((customField) => (
        <LongFieldValue
          key={customField.id}
          customFieldId={customField.id}
          input={input.data}
          projectId={analysis.data.relationships.project?.data?.id}
          phaseId={analysis.data.relationships.phase?.data?.id}
        />
      ))}
      {author && (
        <Box mt="20px" display="flex" alignItems="center">
          <Avatar size={40} userId={author.data.id} />
          <Text m="0px">{getFullName(author?.data)}</Text>
        </Box>
      )}
      <Divider />
      <Taggings inputId={inputId} onlyShowTagged={false} />
    </Box>
  );
};

export default InputListItem;
