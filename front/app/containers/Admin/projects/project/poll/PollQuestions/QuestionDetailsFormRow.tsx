import React, { useState } from 'react';

import { Select, Input, Box } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';
import { IOption } from 'typings';

import { IPollQuestionData } from 'api/poll_questions/types';
import useUpdatePollQuestion from 'api/poll_questions/useUpdatePollQuestion';

import { Row } from 'components/admin/ResourceList';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from '../messages';

import WrongMaxChoiceIndicator from './WrongMaxChoiceIndicator';

const FormContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  flex-direction: row;
  align-items: center;
`;

const StyledInput = styled(Input)`
  max-width: 100px;
  input {
    padding: 10px;
  }
  margin-left: 5px;
`;

interface Props {
  question: IPollQuestionData;
  onCancelOptionEditing: () => void;
}

const QuestionDetailsFormRow = ({ question, onCancelOptionEditing }: Props) => {
  const { mutate: updatePollQuestion } = useUpdatePollQuestion();
  const [maxAnswers, setMaxAnswers] = useState(question.attributes.max_options);
  const [questionType, setQuestionType] = useState(
    question.attributes.question_type
  );
  const { formatMessage } = useIntl();
  const typeOptions = [
    {
      label: formatMessage(messages.singleOption),
      value: 'single_option',
    },
    {
      label: formatMessage(messages.multipleOption),
      value: 'multiple_options',
    },
  ];

  const changeMaxAnswers = (maxAnswers: string) => {
    setMaxAnswers(Number(maxAnswers));
  };

  const changeQuestionType = (option: IOption) => {
    const newType = option.value;
    setQuestionType(newType);
    setMaxAnswers(newType === 'single_option' ? null : 2);
  };

  const validate = () => {
    const diff = {
      ...(questionType !== question.attributes.question_type
        ? { question_type: questionType }
        : {}),
      ...(maxAnswers !== question.attributes.max_options
        ? { max_options: maxAnswers }
        : {}),
    };
    return {
      diff,
      isValid:
        Object.keys(diff).length > 0 &&
        ((questionType === 'multiple_options' &&
          typeof maxAnswers === 'number' &&
          maxAnswers >= 2) ||
          (questionType === 'single_option' && maxAnswers === null)),
    };
  };

  const onSave = () => {
    const { diff, isValid } = validate();
    if (isValid) {
      updatePollQuestion({
        questionId: question.id,
        ...diff,
        phaseId: question.relationships.phase.data.id,
      });
    }
  };

  const { isValid } = validate();
  return (
    <Row>
      <FormContainer>
        <Box minWidth="200px">
          <Select
            options={typeOptions}
            value={questionType}
            onChange={changeQuestionType}
          />
        </Box>
        {questionType === 'multiple_options' && (
          <StyledInput
            type="number"
            onChange={changeMaxAnswers}
            value={String(maxAnswers)}
            // A multiple answer question should have at least two answer options
            min="2"
          />
        )}
      </FormContainer>
      <FormContainer>
        <WrongMaxChoiceIndicator
          questionId={question.id}
          maxAnswers={maxAnswers}
        />
        <ButtonWithLink
          className="e2e-form-question-settings-save"
          buttonStyle="admin-dark"
          onClick={onSave}
          disabled={!isValid}
          mr="8px"
        >
          <FormattedMessage {...messages.saveQuestionSettings} />
        </ButtonWithLink>
        <ButtonWithLink
          className="e2e-collapse-option-form"
          onClick={onCancelOptionEditing}
          buttonStyle="secondary-outlined"
        >
          <FormattedMessage {...messages.cancelEditAnswerOptions} />
        </ButtonWithLink>
      </FormContainer>
    </Row>
  );
};

export default QuestionDetailsFormRow;
