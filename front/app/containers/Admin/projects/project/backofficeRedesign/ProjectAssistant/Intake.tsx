import React, { useState } from 'react';

import { Box, Icon, Text, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { ProjectGenerationLevers } from 'api/project_generations/types';

import { useIntl } from 'utils/cl-intl';

import {
  INTAKE_QUESTIONS,
  IntakeAnswers,
  IntakeOption,
  IntakeQuestionId,
} from './intakeConfig';
import { LeverId } from './leverConfig';
import Levers from './Levers';
import messages from './messages';

// Each question slides in as the one before it is answered, so the panel reads
// as a conversation unfolding rather than a form sitting there all at once.
const Reveal = styled(Box)`
  @keyframes intakeReveal {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  animation: intakeReveal 180ms ease both;
`;

// Soft teal chips — the assistant's own colour, distinct from the navy "Draft"
// action, so answering reads as talking to the assistant, not committing.
const Chip = styled.button<{ $selected: boolean }>`
  appearance: none;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.2;
  padding: 7px 13px;
  border-radius: 999px;
  cursor: pointer;
  transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
  border: 1px solid
    ${({ $selected }) => ($selected ? colors.teal500 : colors.grey300)};
  background: ${({ $selected }) => ($selected ? colors.teal500 : '#fff')};
  color: ${({ $selected }) => ($selected ? '#fff' : colors.textPrimary)};
  font-weight: ${({ $selected }) => ($selected ? 600 : 400)};

  &:hover:not(:disabled) {
    border-color: ${({ $selected }) =>
      $selected ? colors.teal700 : colors.grey400};
    background: ${({ $selected }) =>
      $selected ? colors.teal700 : colors.grey100};
  }

  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
`;

const DetailInput = styled.input`
  width: 100%;
  font-family: inherit;
  font-size: 14px;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid ${colors.grey300};
  background: #fff;
  color: ${colors.textPrimary};
  transition: border-color 120ms ease, box-shadow 120ms ease;

  &::placeholder {
    color: ${colors.grey600};
  }
  &:focus {
    outline: none;
    border-color: ${colors.teal400};
    box-shadow: 0 0 0 3px ${colors.teal100};
  }
  &:disabled {
    opacity: 0.6;
  }
`;

const LinkButton = styled.button`
  appearance: none;
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  font-size: 13px;
  color: ${colors.textSecondary};
  cursor: pointer;
  text-decoration: underline;

  &:hover:not(:disabled) {
    color: ${colors.textPrimary};
  }
  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
`;

type Props = {
  answers: IntakeAnswers;
  levers: ProjectGenerationLevers;
  disabled: boolean;
  onAnswer: (questionId: IntakeQuestionId, option: IntakeOption) => void;
  onDetail: (questionId: IntakeQuestionId, detail: string) => void;
  onLeverChange: (id: LeverId, value: number) => void;
};

const Intake = ({
  answers,
  levers,
  disabled,
  onAnswer,
  onDetail,
  onLeverChange,
}: Props) => {
  const { formatMessage } = useIntl();
  // How many questions are on screen. The first is there from the start; each
  // next one appears as the current one is answered or skipped.
  const [revealedCount, setRevealedCount] = useState(1);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const total = INTAKE_QUESTIONS.length;
  const visible = INTAKE_QUESTIONS.slice(0, revealedCount);
  const advance = () =>
    setRevealedCount((count) => Math.min(count + 1, total));

  return (
    <Box pt="20px" borderTop={`1px solid ${colors.grey200}`}>
      <Box display="flex" gap="10px" mb="16px">
        <Icon
          name="stars"
          width="18px"
          height="18px"
          fill={colors.teal500}
          my="2px"
        />
        <Text m="0px" fontSize="s" color="textSecondary" lineHeight="1.45">
          {formatMessage(messages.intakeLead)}
        </Text>
      </Box>

      <Box display="flex" flexDirection="column" gap="18px">
        {visible.map((question, index) => {
          const answer = answers[question.id];
          const isLastVisible = index === visible.length - 1;
          const isAnswered = !!answer?.optionId;
          const canSkip =
            isLastVisible && !isAnswered && revealedCount < total;

          return (
            <Reveal key={question.id}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="baseline"
                gap="12px"
                mb="8px"
              >
                <Text m="0px" fontSize="s" color="textPrimary">
                  {formatMessage(question.ask)}
                </Text>
                {canSkip && (
                  <LinkButton
                    type="button"
                    disabled={disabled}
                    onClick={advance}
                  >
                    {formatMessage(messages.intakeSkip)}
                  </LinkButton>
                )}
              </Box>

              <Box display="flex" flexWrap="wrap" gap="7px">
                {question.options.map((option) => (
                  <Chip
                    key={option.id}
                    type="button"
                    $selected={answer?.optionId === option.id}
                    disabled={disabled}
                    onClick={() => {
                      onAnswer(question.id, option);
                      if (isLastVisible) advance();
                    }}
                  >
                    {formatMessage(option.label)}
                  </Chip>
                ))}
              </Box>

              {/* The optional free-text appears only once a chip is picked, so
                  it never gets in the way of the one-tap path. */}
              {question.detailPlaceholder && isAnswered && (
                <Box mt="8px">
                  <DetailInput
                    type="text"
                    value={answer?.detail ?? ''}
                    placeholder={formatMessage(question.detailPlaceholder)}
                    disabled={disabled}
                    onChange={(event) =>
                      onDetail(question.id, event.target.value)
                    }
                  />
                </Box>
              )}
            </Reveal>
          );
        })}
      </Box>

      {/* The raw structural dials, for managers who want them. Hidden by default
          so the conversation stays the main path; the answers above have already
          set these. */}
      <Box mt="18px">
        <LinkButton
          type="button"
          disabled={disabled}
          onClick={() => setShowAdvanced((show) => !show)}
        >
          {formatMessage(messages.intakeAdvancedToggle)}
        </LinkButton>
        {showAdvanced && (
          <Reveal mt="4px">
            <Text m="0px" mb="4px" fontSize="s" color="textSecondary">
              {formatMessage(messages.intakeAdvancedHelper)}
            </Text>
            <Levers values={levers} disabled={disabled} onChange={onLeverChange} />
          </Reveal>
        )}
      </Box>
    </Box>
  );
};

export default Intake;
