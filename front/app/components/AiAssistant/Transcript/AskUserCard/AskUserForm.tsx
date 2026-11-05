import React from 'react';

import { Box, Input, Text } from '@citizenlab/cl2-component-library';

import { AskUserQuestion } from 'api/ai_assistant_tool_calls/tools/askUser';
import useAnswerAiAssistantToolCall from 'api/ai_assistant_tool_calls/useAnswerAiAssistantToolCall';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';

import { getErrorMessage, getRequestErrorCode } from '../../errors';
import messages from '../../messages';

import OptionButton from './OptionButton';
import useAskUserForm from './useAskUserForm';

type Props = {
  questions: AskUserQuestion[];
  toolCallId: string;
  conversationId: string;
};

const AskUserForm = ({ questions, toolCallId, conversationId }: Props) => {
  const { formatMessage } = useIntl();
  const { entryFor, togglePick, setWritten, answers } =
    useAskUserForm(questions);
  const {
    mutate: sendAnswers,
    isPending,
    error,
  } = useAnswerAiAssistantToolCall();

  return (
    <>
      {questions.map(({ question, options }) => {
        const { picks, written } = entryFor(question);

        return (
          <Box key={question} display="flex" flexDirection="column" gap="8px">
            <Text m="0px" fontWeight="semi-bold" fontSize="s">
              {question}
            </Text>
            <Box display="flex" flexWrap="wrap" gap="6px">
              {options.map((option) => (
                <OptionButton
                  key={option}
                  label={option}
                  selected={picks.includes(option)}
                  onClick={() => togglePick(question, option)}
                />
              ))}
            </Box>
            <Input
              type="text"
              size="small"
              value={written}
              placeholder={formatMessage(messages.otherAnswer)}
              ariaLabel={formatMessage(messages.otherAnswer)}
              onChange={(text) => setWritten(question, text)}
            />
          </Box>
        );
      })}
      <Box display="flex" justifyContent="flex-end">
        <ButtonWithLink
          type="button"
          buttonStyle="bo-primary"
          icon="send"
          disabled={answers.length === 0}
          processing={isPending}
          onClick={() =>
            sendAnswers({ id: toolCallId, conversationId, answers })
          }
        >
          {formatMessage(messages.sendAnswers)}
        </ButtonWithLink>
      </Box>
      {error && (
        <Text m="0px" fontSize="s" color="error">
          {formatMessage(getErrorMessage(getRequestErrorCode(error)))}
        </Text>
      )}
    </>
  );
};

export default AskUserForm;
