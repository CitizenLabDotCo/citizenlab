import React, { useState } from 'react';

import {
  Box,
  Button,
  Radio,
  Text,
  colors,
  defaultStyles,
  stylingConsts,
} from '@citizenlab/cl2-component-library';

import { IFeedbackPromptData } from 'api/feedback_prompts/types';
import useAnswerFeedbackPrompt from 'api/feedback_prompts/useAnswerFeedbackPrompt';
import useDismissFeedbackPrompt from 'api/feedback_prompts/useDismissFeedbackPrompt';

import CloseIconButton from 'components/UI/CloseIconButton';
import TextArea from 'components/UI/TextArea';

import { ScreenReaderOnly } from 'utils/a11y';
import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import questions from './questions';

const SCORES = [1, 2, 3, 4, 5, 6, 7];

interface Props {
  prompt: IFeedbackPromptData;
  onClose: () => void;
}

const PromptCard = ({ prompt, onClose }: Props) => {
  const { formatMessage } = useIntl();
  const [score, setScore] = useState<number>();
  const [comment, setComment] = useState('');
  const {
    mutate: answer,
    isPending: isSending,
    isSuccess: isAnswered,
  } = useAnswerFeedbackPrompt();
  const { mutate: dismiss } = useDismissFeedbackPrompt();

  const question = formatMessage(questions[prompt.attributes.key]);
  const radioName = `feedback-prompt-score-${prompt.id}`;

  const handleClose = () => {
    if (!isAnswered && !isSending) dismiss(prompt.id);
    onClose();
  };

  // The shared Radio keeps its input read-only, so arrow keys need wiring to
  // behave like a native radio group.
  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    const current = score ?? 0;
    const next = {
      ArrowLeft: current - 1,
      ArrowUp: current - 1,
      ArrowRight: current + 1,
      ArrowDown: current + 1,
      Home: 1,
      End: SCORES.length,
    }[event.key];
    if (next === undefined) return;

    event.preventDefault();
    const clamped = Math.min(Math.max(next, 1), SCORES.length);
    setScore(clamped);
    document.getElementById(`${radioName}-${clamped}`)?.focus();
  };

  const handleSend = () => {
    if (score === undefined) return;
    answer({ id: prompt.id, score, comment: comment.trim() || undefined });
  };

  return (
    <Box
      as="section"
      aria-label={question}
      position="fixed"
      bottom="24px"
      right="24px"
      zIndex="1000"
      width="360px"
      maxWidth="calc(100vw - 48px)"
      p="20px"
      bgColor={colors.white}
      borderRadius={stylingConsts.borderRadius}
      boxShadow={defaultStyles.boxShadowHoverBig}
    >
      <Box position="absolute" top="12px" right="12px">
        <CloseIconButton
          onClick={handleClose}
          a11y_buttonActionMessage={messages.close}
          iconColor={colors.textSecondary}
          iconColorOnHover={colors.textPrimary}
        />
      </Box>
      <Box aria-live="polite">
        {isAnswered ? (
          <Text m="0" pr="24px">
            {formatMessage(messages.thanks)}
          </Text>
        ) : (
          <Box as="fieldset" border="none" p="0" m="0">
            <Box as="legend" p="0" mb="16px" pr="24px">
              <Text as="span" m="0" fontWeight="semi-bold">
                {question}
              </Text>
              <ScreenReaderOnly>
                {` (${formatMessage(messages.scaleHint)})`}
              </ScreenReaderOnly>
            </Box>
            <Box
              display="flex"
              justifyContent="space-between"
              onKeyDown={handleKeyDown}
            >
              {SCORES.map((value) => (
                <Radio
                  key={value}
                  id={`${radioName}-${value}`}
                  name={radioName}
                  value={value}
                  currentValue={score}
                  label={String(value)}
                  onChange={setScore}
                />
              ))}
            </Box>
            <Box display="flex" justifyContent="space-between" aria-hidden>
              <Text m="0" fontSize="s" color="textSecondary">
                {formatMessage(messages.veryHard)}
              </Text>
              <Text m="0" fontSize="s" color="textSecondary">
                {formatMessage(messages.veryEasy)}
              </Text>
            </Box>
            {score !== undefined && (
              <Box mt="16px">
                <TextArea
                  id={`feedback-prompt-comment-${prompt.id}`}
                  label={formatMessage(messages.commentLabel)}
                  value={comment}
                  onChange={setComment}
                  rows={3}
                />
                <Box display="flex" justifyContent="flex-end" mt="12px">
                  <Button
                    buttonStyle="primary"
                    onClick={handleSend}
                    processing={isSending}
                  >
                    {formatMessage(messages.send)}
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default PromptCard;
