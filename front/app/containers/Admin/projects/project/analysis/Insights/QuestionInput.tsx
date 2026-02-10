import React, { useState } from 'react';

import {
  Input,
  Box,
  colors,
  stylingConsts,
  Button,
} from '@citizenlab/cl2-component-library';
import { useParams } from 'utils/router';

import useAnalysis from 'api/analyses/useAnalysis';
import useAddAnalysisQuestion from 'api/analysis_questions/useAddAnalysisQuestion';

import tracks from 'containers/Admin/projects/project/analysis/tracks';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';

import useAnalysisFilterParams from '../hooks/useAnalysisFilterParams';

import messages from './messages';

const QuestionInput = ({ onClose }: { onClose: () => void }) => {
  const [question, setQuestion] = useState('');
  const { formatMessage } = useIntl();
  const { mutate: askQuestion, isLoading } = useAddAnalysisQuestion();
  const { analysisId } = useParams({ strict: false }) as { analysisId: string };
  const { data: analysis } = useAnalysis(analysisId);
  const fileIds = analysis?.data.relationships.files?.data.map(
    (file) => file.id
  );
  const filters = useAnalysisFilterParams();

  const handleAskQuestion = () => {
    askQuestion(
      {
        analysisId,
        filters,
        question,
        fileIds,
      },
      {
        onSuccess: () => {
          trackEventByName(tracks.questionCreated, {
            analysisId,
          });
          onClose();
        },
      }
    );
  };

  return (
    <Box
      bgColor={colors.successLight}
      p="16px"
      borderRadius={stylingConsts.borderRadius}
      display="flex"
      gap="8px"
      flexDirection="column"
      as="form"
    >
      <Input
        value={question}
        onChange={(value) => setQuestion(value)}
        type="text"
        placeholder="Type your question here"
      />
      <Box display="flex" justifyContent="flex-end">
        <Button
          buttonStyle="admin-dark"
          onClick={handleAskQuestion}
          processing={isLoading}
          disabled={!question}
          type="submit"
        >
          {formatMessage(messages.ask)}
        </Button>
      </Box>
    </Box>
  );
};

export default QuestionInput;
