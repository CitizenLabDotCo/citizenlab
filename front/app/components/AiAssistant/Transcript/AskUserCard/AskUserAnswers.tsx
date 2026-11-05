import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import { AskUserQuestion } from 'api/ai_assistant_tool_calls/tools/askUser';
import { AiAssistantAnswer } from 'api/ai_assistant_tool_calls/types';

type Props = {
  questions: AskUserQuestion[];
  answers?: AiAssistantAnswer[] | null;
};

const AskUserAnswers = ({ questions, answers }: Props) => (
  <>
    {questions.map(({ question }) => {
      const answer = answers?.find(
        (given) => given.question === question
      )?.answer;

      return (
        <Box key={question} display="flex" flexDirection="column" gap="8px">
          <Text m="0px" fontWeight="semi-bold" fontSize="s">
            {question}
          </Text>
          {answer && (
            <Text m="0px" fontSize="s" color="textSecondary">
              {answer}
            </Text>
          )}
        </Box>
      );
    })}
  </>
);

export default AskUserAnswers;
