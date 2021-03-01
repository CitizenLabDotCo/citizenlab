import React from 'react';
import GetPollOptions, {
  GetPollOptionsChildProps,
} from 'resources/GetPollOptions';
import { adopt } from 'react-adopt';
import { IPollQuestion } from 'services/pollQuestions';
import styled from 'styled-components';
import { Radio } from 'cl2-component-library';
import {
  QuestionContainer,
  Question,
  QuestionNumber,
  QuestionText,
} from './PollForm';
import { isNilOrError } from 'utils/helperUtils';
import T from 'components/T';

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

interface InputProps {
  question: IPollQuestion;
  index: number;
  value: string | undefined;
  disabled: boolean;
  onChange: (questionId: string, optionId: string) => () => void;
}

interface DataProps {
  options: GetPollOptionsChildProps;
}

interface Props extends InputProps, DataProps {}

const PollSingleChoice = ({
  question,
  index,
  options,
  value,
  disabled,
  onChange,
}: Props) => {
  return (
    <StyledFieldSet key={question.id}>
      {isNilOrError(options) || options.length === 0 ? null : (
        <QuestionContainer className="e2e-poll-question">
          <Question>
            <QuestionNumber>{index + 1}</QuestionNumber>
            <QuestionText>
              <T value={question.attributes.title_multiloc} />
            </QuestionText>
          </Question>
          {options.map((option) => (
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

const Data = adopt<DataProps, InputProps>({
  options: ({ question, render }) => (
    <GetPollOptions questionId={question.id}>{render}</GetPollOptions>
  ),
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataprops) => <PollSingleChoice {...inputProps} {...dataprops} />}
  </Data>
);
