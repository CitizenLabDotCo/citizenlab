import { Box, Title, colors } from '@citizenlab/cl2-component-library';
import useAnalysis from 'api/analyses/useAnalysis';
import useAnalysisInput from 'api/analysis_inputs/useAnalysisInput';
import T from 'components/T';
import React from 'react';
import { useParams } from 'react-router-dom';

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
      <Title variant="h3">
        <T value={input.data.attributes.title_multiloc} />
      </Title>
      <T value={input.data.attributes.body_multiloc} />
    </Box>
  );
};

export default InputListItem;
