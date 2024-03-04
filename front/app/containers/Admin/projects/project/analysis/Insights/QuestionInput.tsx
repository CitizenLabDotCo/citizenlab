import React, { useState } from 'react';

import {
  Input,
  Box,
  colors,
  stylingConsts,
  Button,
} from '@citizenlab/cl2-component-library';
import tracks from 'containers/Admin/projects/project/analysis/tracks';
import { useParams } from 'react-router-dom';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';

import useAddAnalysisQuestion from 'api/analysis_questions/useAddAnalysisQuestion';

import useAnalysisFilterParams from '../hooks/useAnalysisFilterParams';

import messages from './messages';

const QuestionInput = ({ onClose }: { onClose: () => void }) => {
  const [question, setQuestion] = useState('');
  const { formatMessage } = useIntl();
  const { mutate: askQuestion, isLoading } = useAddAnalysisQuestion();
  const { analysisId } = useParams() as { analysisId: string };
  const filters = useAnalysisFilterParams();

  const handleAskQuestion = () => {
    askQuestion(
      {
        analysisId,
        filters,
        question,
      },
      {
        onSuccess: () => {
          trackEventByName(tracks.questionCreated.name, {
            extra: { analysisId },
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
      mb="8px"
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
