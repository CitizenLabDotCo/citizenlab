import React, { useState } from 'react';

import {
  Box,
  fontSizes,
  defaultCardStyle,
  Tooltip,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useAuthUser from 'api/me/useAuthUser';
import { IPollQuestionData } from 'api/poll_questions/types';
import useAddPollResponse from 'api/poll_responses/useAddPollResponse';

import { triggerAuthenticationFlow } from 'containers/Authentication/events';

import ButtonWithLink from 'components/UI/ButtonWithLink';
import Warning from 'components/UI/Warning';

import { FormattedMessage, MessageDescriptor, useIntl } from 'utils/cl-intl';
import { isNilOrError, toggleElementInArray } from 'utils/helperUtils';

import messages from './messages';
import PollMultipleChoice from './PollMultipleChoice';
import PollSingleChoice from './PollSingleChoice';

const PollContainer = styled.div`
  color: ${({ theme }) => theme.colors.tenantText};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export const QuestionContainer = styled.div`
  width: 100%;
  padding: 20px;
  ${defaultCardStyle};
`;

export const Question = styled.h3`
  display: flex;
  align-items: center;
`;

export const QuestionNumber = styled.span`
  flex: 0 0 25px;
  width: 25px;
  height: 25px;
  font-size: ${fontSizes.base}px;
  line-height: normal;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f2f2f2;
  border-radius: ${(props) => props.theme.borderRadius};
  margin-right: 13px;
`;

export const QuestionText = styled.span`
  font-size: ${fontSizes.l}px;
  font-weight: 600;
`;

interface Props {
  questions: IPollQuestionData[];
  projectId: string;
  phaseId: string;
  disabled: boolean;
  disabledMessage?: MessageDescriptor | null;
  actionDisabledAndNotFixable: boolean;
}

interface Answers {
  [questionId: string]: string[];
}

const PollForm = ({
  questions,
  phaseId,
  disabled,
  projectId,
  disabledMessage,
  actionDisabledAndNotFixable,
}: Props) => {
  const [answers, setAnswers] = useState<Answers>({});
  const { mutate: addPollResponse } = useAddPollResponse();
  const { data: authUser } = useAuthUser();
  const { formatMessage } = useIntl();
  const changeAnswerSingle = (questionId: string, optionId: string) => () => {
    setAnswers({ ...answers, [questionId]: [optionId] });
  };

  const changeAnswerMultiple = (questionId: string, optionId: string) => () => {
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const oldAnswer = answers[questionId] || [];

    toggleElementInArray(oldAnswer, optionId);

    setAnswers({ ...answers, [questionId]: oldAnswer });
  };

  const sendAnswer = () => {
    if (!authUser || (disabled && !actionDisabledAndNotFixable)) {
      if (!phaseId) return;

      triggerAuthenticationFlow({
        context: {
          action: 'taking_poll',
          id: phaseId,
          type: 'phase',
        },
        successAction: {
          name: 'submitPoll',
          params: {
            phaseId,
            answers: Object.values(answers).flat(),
            projectId,
          },
        },
      });
    } else {
      addPollResponse({
        phaseId,
        optionIds: Object.values(answers).flat(),
        projectId,
      });
    }
  };

  const validate = () => {
    // you can submit the form...
    return (
      // each question has at least one answer, and this answer is a string (representing the option) and...
      questions.every(
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        (question) => typeof (answers[question.id] || [])[0] === 'string'
      ) &&
      // for multiple options questions...
      questions
        .filter(
          (question) => question.attributes.question_type === 'multiple_options'
        )
        // the number of answers must not be greater than the maximum of answer allowed.
        .every(
          (question) =>
            question.attributes.max_options &&
            answers[question.id].length <= question.attributes.max_options
        )
    );
  };

  if (!isNilOrError(questions) && questions.length > 0) {
    const isValid = validate();

    return (
      <>
        {authUser &&
          !isNilOrError(disabledMessage) &&
          actionDisabledAndNotFixable && (
            <Box mb="16px">
              <Warning>{formatMessage(disabledMessage)}</Warning>
            </Box>
          )}
        <PollContainer id="project-poll" className="e2e-poll-form">
          {questions.map((question, questionIndex) =>
            question.attributes.question_type === 'single_option' ? (
              <PollSingleChoice
                key={questionIndex}
                question={question}
                index={questionIndex}
                // TODO: Fix this the next time the file is edited.
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                value={(answers[question.id] || [])[0]}
                disabled={actionDisabledAndNotFixable}
                onChange={changeAnswerSingle}
              />
            ) : (
              <PollMultipleChoice
                key={questionIndex}
                question={question}
                index={questionIndex}
                value={answers[question.id]}
                disabled={actionDisabledAndNotFixable}
                onChange={changeAnswerMultiple}
              />
            )
          )}
        </PollContainer>
        <Tooltip
          disabled={!actionDisabledAndNotFixable}
          placement="bottom"
          content={disabledMessage && formatMessage(disabledMessage)}
        >
          <div>
            <ButtonWithLink
              onClick={sendAnswer}
              size="m"
              fullWidth={true}
              disabled={!isValid || actionDisabledAndNotFixable}
              className="e2e-send-poll"
            >
              <FormattedMessage {...messages.sendAnswer} />
            </ButtonWithLink>
          </div>
        </Tooltip>
      </>
    );
  }

  return null;
};

export default PollForm;
