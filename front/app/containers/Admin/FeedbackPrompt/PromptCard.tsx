import React, { useRef, useState } from 'react';

import {
  Box,
  Button,
  Text,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';

import {
  IFeedbackPrompt,
  IFeedbackPromptAnswer,
  IFeedbackPromptData,
} from 'api/feedback_prompts/types';
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
  const [isSubmitted, setIsSubmitted] = useState(false);
  const hasSavedScore = useRef(false);
  const saveRequest = useRef<Promise<IFeedbackPrompt> | null>(null);
  const {
    mutateAsync: answer,
    isPending: isSending,
    isError,
  } = useAnswerFeedbackPrompt();
  const { mutate: dismiss } = useDismissFeedbackPrompt();

  const question = formatMessage(questions[prompt.attributes.key]);
  const scoreId = `feedback-prompt-score-${prompt.id}`;

  const handleClose = () => {
    if (!hasSavedScore.current) {
      if (saveRequest.current) {
        // A close during saving must become a dismissal if that save fails.
        saveRequest.current.catch(() => dismiss(prompt.id));
      } else {
        dismiss(prompt.id);
      }
    }
    onClose();
  };

  const saveAnswer = (body: IFeedbackPromptAnswer, onSuccess?: () => void) => {
    if (saveRequest.current) return;

    const request = answer(body);
    saveRequest.current = request;
    request
      .then(() => {
        hasSavedScore.current = true;
        onSuccess?.();
      })
      .catch(() => {})
      .finally(() => {
        saveRequest.current = null;
      });
  };

  const handleScore = (value: number) => {
    if (saveRequest.current) return;
    if (score === value && hasSavedScore.current && !isError) return;

    setScore(value);
    saveAnswer({ id: prompt.id, score: value });
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLElement>,
    current: number
  ) => {
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
    if (saveRequest.current) return;

    const clamped = Math.min(Math.max(next, 1), SCORES.length);
    handleScore(clamped);
    document
      .getElementById(`${scoreId}-${clamped}`)
      ?.querySelector('button')
      ?.focus();
  };

  const handleSend = () => {
    if (score === undefined) return;
    saveAnswer(
      { id: prompt.id, score, comment: comment.trim() || undefined },
      () => setIsSubmitted(true)
    );
  };

  return (
    <Box
      as="section"
      data-cy="feedback-prompt"
      aria-label={question}
      position="fixed"
      bottom="24px"
      right="24px"
      zIndex="1000"
      width="420px"
      maxWidth="calc(100vw - 48px)"
      p="24px"
      bgColor={colors.white}
      borderRadius={stylingConsts.borderRadius}
      border={`1px solid ${colors.grey200}`}
    >
      <Box data-cy="feedback-close" position="absolute" top="12px" right="12px">
        <CloseIconButton
          onClick={handleClose}
          a11y_buttonActionMessage={messages.close}
          iconColor={colors.textSecondary}
          iconColorOnHover={colors.textPrimary}
        />
      </Box>
      <Box aria-live="polite">
        {isSubmitted ? (
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
            <Box display="flex" gap="6px">
              {SCORES.map((value) => (
                <Button
                  key={value}
                  dataCy={`feedback-score-${value}`}
                  id={`${scoreId}-${value}`}
                  type="button"
                  buttonStyle="secondary-outlined"
                  ariaPressed={score === value}
                  onClick={() => handleScore(value)}
                  onKeyDown={(event) => handleKeyDown(event, value)}
                  disabled={isSending}
                  width="100%"
                  fullWidth
                  height="40px"
                  padding="0"
                  fontSize="16px"
                  fontWeight="500"
                  borderRadius={stylingConsts.borderRadius}
                  borderColor={
                    score === value ? colors.teal500 : colors.grey300
                  }
                  borderHoverColor={colors.teal500}
                  bgColor={score === value ? colors.teal50 : colors.white}
                  bgHoverColor={colors.teal50}
                  textColor={
                    score === value ? colors.teal700 : colors.coolGrey600
                  }
                  textHoverColor={colors.teal700}
                >
                  {value}
                </Button>
              ))}
            </Box>
            <Box
              display="flex"
              justifyContent="space-between"
              mt="8px"
              aria-hidden
            >
              <Text m="0" fontSize="s" color="textSecondary">
                {formatMessage(messages.veryHard)}
              </Text>
              <Text m="0" fontSize="s" color="textSecondary">
                {formatMessage(messages.veryEasy)}
              </Text>
            </Box>
            {isError && (
              <Text role="alert" color="red600" fontSize="s">
                {formatMessage(messages.saveError)}
              </Text>
            )}
            {score !== undefined && (
              <Box
                mt="20px"
                pt="20px"
                borderTop={`1px solid ${colors.grey200}`}
              >
                <TextArea
                  id={`feedback-prompt-comment-${prompt.id}`}
                  label={formatMessage(messages.commentLabel)}
                  value={comment}
                  onChange={setComment}
                  rows={3}
                />
                <Box display="flex" justifyContent="flex-end" mt="12px">
                  <Button
                    buttonStyle="admin-dark"
                    type="button"
                    dataCy="feedback-send"
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
