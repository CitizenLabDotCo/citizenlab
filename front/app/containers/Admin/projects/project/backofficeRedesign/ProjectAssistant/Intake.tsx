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

// The intake reads as a short "setup questions" sheet: every question on screen
// at once under a sectioned header, each one numbered, bold-titled and
// skippable — flat on white with hairline dividers, matching the prototype.

// A pill option. Selected reads as a dark filled chip ringed in orange with a
// check — clearly "chosen" without shifting the layout (the ring is a shadow,
// so the chip doesn't change size when picked).
const Chip = styled.button<{ $selected: boolean }>`
  appearance: none;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-family: inherit;
  font-size: 15px;
  line-height: 1.2;
  padding: 9px 16px;
  border-radius: 999px;
  cursor: pointer;
  transition: background 120ms ease, border-color 120ms ease,
    box-shadow 120ms ease, color 120ms ease;
  border: 1px solid
    ${({ $selected }) => ($selected ? 'transparent' : colors.grey300)};
  background: ${({ $selected }) => ($selected ? colors.teal700 : '#fff')};
  color: ${({ $selected }) => ($selected ? '#fff' : colors.textPrimary)};
  font-weight: ${({ $selected }) => ($selected ? 600 : 400)};
  box-shadow: ${({ $selected }) =>
    $selected ? `0 0 0 2px ${colors.orange500}` : 'none'};

  &:hover:not(:disabled) {
    border-color: ${({ $selected }) =>
      $selected ? 'transparent' : colors.grey400};
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

// Teal underlined links — Skip, Undo, Fine-tune — matching the prototype.
const LinkButton = styled.button`
  appearance: none;
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  font-size: 14px;
  color: ${colors.teal700};
  cursor: pointer;
  text-decoration: underline;

  &:hover:not(:disabled) {
    color: ${colors.teal500};
  }
  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
`;

// Left margin that lines options and detail up under the question title (past
// the number column), so title and options read as two clear levels.
const INDENT = '38px';

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
  const [skipped, setSkipped] = useState<Set<IntakeQuestionId>>(new Set());
  const [showAdvanced, setShowAdvanced] = useState(false);

  const total = INTAKE_QUESTIONS.length;
  const answeredCount = INTAKE_QUESTIONS.filter(
    (question) => !!answers[question.id]?.optionId
  ).length;

  const skip = (id: IntakeQuestionId) =>
    setSkipped((current) => new Set(current).add(id));
  const unskip = (id: IntakeQuestionId) =>
    setSkipped((current) => {
      const next = new Set(current);
      next.delete(id);
      return next;
    });

  return (
    <Box mt="8px">
      {/* Sectioned header with a running answered-count, so the whole set reads
          as one short, optional sheet. */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="baseline"
        pb="10px"
        mb="4px"
        borderBottom={`1px solid ${colors.grey200}`}
      >
        <Text
          m="0px"
          fontSize="xs"
          fontWeight="bold"
          color="textSecondary"
          style={{ letterSpacing: '0.08em', textTransform: 'uppercase' }}
        >
          Setup questions
        </Text>
        <Text m="0px" fontSize="s" color="textSecondary">
          {answeredCount} of {total} answered
        </Text>
      </Box>

      {INTAKE_QUESTIONS.map((question, index) => {
        const answer = answers[question.id];
        const isAnswered = !!answer?.optionId;
        const isSkipped = skipped.has(question.id);
        const selectedOption = question.options.find(
          (option) => option.id === answer?.optionId
        );
        const questionHasOther = question.options.some((o) => o.isOther);
        const showDetail =
          !!question.detailPlaceholder &&
          isAnswered &&
          (!questionHasOther || !!selectedOption?.isOther);

        return (
          <Box
            key={question.id}
            py="16px"
            borderBottom={`1px solid ${colors.grey200}`}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="flex-start"
              gap="12px"
            >
              <Box display="flex" gap="14px" alignItems="baseline" minWidth="0">
                <Box flex="0 0 auto">
                  <Text m="0px" fontSize="s" fontWeight="bold" color="textSecondary">
                    {String(index + 1).padStart(2, '0')}
                  </Text>
                </Box>
                <Text
                  m="0px"
                  fontSize="l"
                  fontWeight="bold"
                  color="textPrimary"
                  lineHeight="1.3"
                >
                  {formatMessage(question.ask)}
                </Text>
              </Box>
              {!isSkipped && (
                <LinkButton
                  type="button"
                  disabled={disabled}
                  onClick={() => skip(question.id)}
                >
                  {formatMessage(messages.intakeSkip)}
                </LinkButton>
              )}
            </Box>

            {isSkipped ? (
              <Box
                mt="10px"
                ml={INDENT}
                display="flex"
                alignItems="center"
                gap="8px"
              >
                <Text m="0px" fontSize="s" color="textSecondary">
                  Skipped
                </Text>
                <LinkButton
                  type="button"
                  disabled={disabled}
                  onClick={() => unskip(question.id)}
                >
                  Undo
                </LinkButton>
              </Box>
            ) : (
              <>
                <Box
                  mt="12px"
                  ml={INDENT}
                  display="flex"
                  flexWrap="wrap"
                  gap="8px"
                >
                  {question.options.map((option) => {
                    const selected = answer?.optionId === option.id;
                    return (
                      <Chip
                        key={option.id}
                        type="button"
                        $selected={selected}
                        disabled={disabled}
                        onClick={() => onAnswer(question.id, option)}
                      >
                        {selected && (
                          <Icon
                            name="check"
                            width="14px"
                            height="14px"
                            fill="#fff"
                          />
                        )}
                        {formatMessage(option.label)}
                      </Chip>
                    );
                  })}
                </Box>

                {/* The optional free-text appears only once a chip is picked, so
                    it never gets in the way of the one-tap path. */}
                {showDetail && (
                  <Box mt="10px" ml={INDENT}>
                    <DetailInput
                      type="text"
                      value={answer?.detail ?? ''}
                      placeholder={
                        question.detailPlaceholder
                          ? formatMessage(question.detailPlaceholder)
                          : undefined
                      }
                      disabled={disabled}
                      onChange={(event) =>
                        onDetail(question.id, event.target.value)
                      }
                    />
                  </Box>
                )}
              </>
            )}
          </Box>
        );
      })}

      {/* The raw structural dials, for managers who want them. Hidden by default
          so the questions stay the main path; the answers above already set
          these. */}
      <Box pt="16px">
        <LinkButton
          type="button"
          disabled={disabled}
          onClick={() => setShowAdvanced((show) => !show)}
        >
          {formatMessage(messages.intakeAdvancedToggle)}
        </LinkButton>
        {showAdvanced && (
          <Box mt="4px">
            <Text m="0px" mb="4px" fontSize="s" color="textSecondary">
              {formatMessage(messages.intakeAdvancedHelper)}
            </Text>
            <Levers values={levers} disabled={disabled} onChange={onLeverChange} />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Intake;
