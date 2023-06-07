import React from 'react';
import { IPollQuestionData } from 'api/poll_questions/types';
import styled from 'styled-components';
import { Radio } from '@citizenlab/cl2-component-library';
import {
  QuestionContainer,
  Question,
  QuestionNumber,
  QuestionText,
} from './PollForm';
import { isNilOrError } from 'utils/helperUtils';
import T from 'components/T';
import usePollOptions from 'api/poll_options/usePollOptions';

const StyledFieldSet = styled.fieldset`
  width: 100%;
  border: none;
  padding: 0;
  margin: 0;
  margin-bottom: 18px;
`;

const StyledRadio = styled(Radio)`
  margin-left: 35px;
`;

interface Props {
  question: IPollQuestionData;
  index: number;
  value: string | undefined;
  disabled: boolean;
  onChange: (questionId: string, optionId: string) => () => void;
}

const PollSingleChoice = ({
  question,
  index,
  value,
  disabled,
  onChange,
}: Props) => {
  const { data: options } = usePollOptions(question.id);
  return (
    <StyledFieldSet key={question.id}>
      {isNilOrError(options) || options.data.length === 0 ? null : (
        <QuestionContainer className="e2e-poll-question">
          <Question>
            <QuestionNumber>{index + 1}</QuestionNumber>
            <QuestionText>
              <T value={question.attributes.title_multiloc} />
            </QuestionText>
          </Question>
          {options.data.map((option) => (
            <StyledRadio
              className="e2e-poll-option"
              key={option.id}
              onChange={onChange(question.id, option.id)}
              currentValue={value}
              value={option.id}
              name={question.id}
              id={option.id}
              label={<T value={option.attributes.title_multiloc} />}
              disabled={disabled}
            />
          ))}
        </QuestionContainer>
      )}
    </StyledFieldSet>
  );
};

export default PollSingleChoice;
