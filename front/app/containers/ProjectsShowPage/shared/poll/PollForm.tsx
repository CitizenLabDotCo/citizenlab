import React, { useState } from 'react';

// types
import { IParticipationContextType } from 'typings';
import { IPollQuestionData } from 'api/poll_questions/types';

// components
import Button from 'components/UI/Button';
import PollSingleChoice from './PollSingleChoice';
import PollMultipleChoice from './PollMultipleChoice';
import { triggerAuthenticationFlow } from 'containers/Authentication/events';
import Tippy from '@tippyjs/react';
import Warning from 'components/UI/Warning';
import { Box } from '@citizenlab/cl2-component-library';

// style
import styled from 'styled-components';
import { fontSizes, defaultCardStyle } from 'utils/styleUtils';

// hooks
import useAddPollResponse from 'api/poll_responses/useAddPollResponse';
import useAuthUser from 'api/me/useAuthUser';

// i18n
import { FormattedMessage, MessageDescriptor, useIntl } from 'utils/cl-intl';
import messages from './messages';

// utils
import { isNilOrError, toggleElementInArray } from 'utils/helperUtils';

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
  phaseId?: string | null;
  id: string | null;
  type: IParticipationContextType;
  disabled: boolean;
  disabledMessage?: MessageDescriptor | null;
  actionDisabledAndNotFixable: boolean;
}

interface Answers {
  [questionId: string]: string[];
}

const PollForm = ({
  questions,
  id,
  type,
  disabled,
  projectId,
  phaseId,
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
    const oldAnswer = answers[questionId] || [];

    toggleElementInArray(oldAnswer, optionId);

    setAnswers({ ...answers, [questionId]: oldAnswer });
  };

  const sendAnswer = () => {
    if (id) {
      if (!authUser || !actionDisabledAndNotFixable) {
        const pcType = phaseId ? 'phase' : 'project';
        const pcId = phaseId ? phaseId : projectId;
        if (!pcId || !pcType) return;

        triggerAuthenticationFlow({
          flow: 'signup',
          context: {
            action: 'taking_poll',
            id: pcId,
            type: pcType,
          },
          successAction: {
            name: 'submit_poll',
            params: {
              id,
              type,
              answers: Object.values(answers).flat(),
              projectId,
            },
          },
        });
      } else {
        addPollResponse({
          participationContextId: id,
          participationContextType: type,
          optionIds: Object.values(answers).flat(),
          projectId,
        });
      }
    }
  };

  const validate = () => {
    // you can submit the form...
    return (
      !disabled && // when it's not disabled and...
      // each question has at least one answer, and this answer is a string (representing the option) and...
      questions.every(
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
        <Tippy
          disabled={!actionDisabledAndNotFixable}
          interactive={true}
          placement="bottom"
          content={disabledMessage && formatMessage(disabledMessage)}
        >
          <div>
            <Button
              onClick={sendAnswer}
              size="m"
              fullWidth={true}
              disabled={!isValid || actionDisabledAndNotFixable}
              className="e2e-send-poll"
            >
              <FormattedMessage {...messages.sendAnswer} />
            </Button>
          </div>
        </Tippy>
      </>
    );
  }

  return null;
};

export default PollForm;
