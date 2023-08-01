import React from 'react';
import { useParams } from 'react-router-dom';
import { Box, colors } from '@citizenlab/cl2-component-library';

import useAnalysis from 'api/analyses/useAnalysis';
import useAnalysisInput from 'api/analysis_inputs/useAnalysisInput';

import Divider from 'components/admin/Divider';
import Taggings from '../Taggings';
import FieldValue from './FieldValue';

interface Props {
  inputId: string;
}

const InputListItem = ({ inputId }: Props) => {
  const { analysisId } = useParams() as { analysisId: string };
  const { data: input } = useAnalysisInput(analysisId, inputId);

  const { data: analysis } = useAnalysis(analysisId);

  if (!analysis || !input) return null;

  return (
    <Box bg={colors.white} w="100%" p="24px">
      {analysis.data.relationships.custom_fields.data.map((customField) => (
        <FieldValue
          key={customField.id}
          customFieldId={customField.id}
          input={input}
          projectId={analysis.data.relationships.project?.data?.id}
          phaseId={analysis.data.relationships.phase?.data?.id}
        />
      ))}
      <Divider />
      <Taggings inputId={inputId} />
    </Box>
  );
};

export default InputListItem;
