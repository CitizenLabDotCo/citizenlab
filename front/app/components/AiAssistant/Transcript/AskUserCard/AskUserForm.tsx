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

// One question at a time; the answers are sent together after the last one.
const AskUserForm = ({ questions, toolCallId, conversationId }: Props) => {
  const { formatMessage } = useIntl();
  const {
    current,
    entry,
    index,
    isLastQuestion,
    goBack,
    goNext,
    togglePick,
    setWritten,
    answers,
  } = useAskUserForm(questions);
  const {
    mutate: sendAnswers,
    isPending,
    error,
  } = useAnswerAiAssistantToolCall();

  return (
    <>
      <Box display="flex" flexDirection="column" gap="8px">
        <Text m="0px" fontWeight="semi-bold" fontSize="s">
          {current.question}
        </Text>
        <Box display="flex" flexWrap="wrap" gap="6px">
          {current.options.map((option) => (
            <OptionButton
              key={option}
              label={option}
              selected={entry.picks.includes(option)}
              onClick={() => togglePick(option)}
            />
          ))}
        </Box>
        <Input
          type="text"
          variant="bo"
          value={entry.written}
          placeholder={formatMessage(messages.otherAnswer)}
          ariaLabel={formatMessage(messages.otherAnswer)}
          onChange={setWritten}
        />
      </Box>
      <Box display="flex" alignItems="center" gap="8px">
        {questions.length > 1 && (
          <Text m="0px" variant="boMicro">
            {formatMessage(messages.questionProgress, {
              current: index + 1,
              total: questions.length,
            })}
          </Text>
        )}
        <Box display="flex" gap="8px" ml="auto">
          {index > 0 && (
            <ButtonWithLink
              type="button"
              buttonStyle="bo-text"
              boSize="medium"
              onClick={goBack}
            >
              {formatMessage(messages.previousQuestion)}
            </ButtonWithLink>
          )}
          {isLastQuestion ? (
            <ButtonWithLink
              type="button"
              buttonStyle="bo-primary"
              boSize="medium"
              icon="send"
              disabled={answers.length === 0}
              processing={isPending}
              onClick={() =>
                sendAnswers({ id: toolCallId, conversationId, answers })
              }
            >
              {formatMessage(messages.sendAnswers)}
            </ButtonWithLink>
          ) : (
            <ButtonWithLink
              type="button"
              buttonStyle="bo-primary"
              boSize="medium"
              onClick={goNext}
            >
              {formatMessage(messages.nextQuestion)}
            </ButtonWithLink>
          )}
        </Box>
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
