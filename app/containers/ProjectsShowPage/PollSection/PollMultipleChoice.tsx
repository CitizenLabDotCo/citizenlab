import React from 'react';
import GetPollOptions, { GetPollOptionsChildProps } from 'resources/GetPollOptions';
import { adopt } from 'react-adopt';
import { IPollQuestion } from 'services/pollQuestions';
import styled from 'styled-components';
import Checkbox from 'components/UI/Checkbox';
import { QuestionContainer, Label, QuestionNumber, QuestionText } from './PollForm';
import { isNilOrError } from 'utils/helperUtils';
import T from 'components/T';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

const StyledFieldSet = styled.fieldset`
  width: 100%;
  border: none;
`;

const StyledCheckbox = styled(Checkbox)`
  margin: 5px;
  margin-left: 35px;
`;

const MaxText = styled.span`
  font-weight: 400;
`;

interface InputProps {
  question: IPollQuestion;
  index: number;
  value: string[] | undefined;
  onChange: (questionId: string, optionId: string) => () => void;
}

interface DataProps {
  options: GetPollOptionsChildProps;
}

interface Props extends InputProps, DataProps { }

const PollSingleChoice = ({ question, index, options, value, onChange }: Props) => {
  return (
    <StyledFieldSet key={question.id}>
      {isNilOrError(options) || options.length === 0 ? null : (
        <QuestionContainer className="e2e-poll-question">
          <Label>
            <QuestionNumber>
              {index + 1}
            </QuestionNumber>
            <QuestionText>
              <T value={question.attributes.title_multiloc} />
              <MaxText>
                {' ('}
                <FormattedMessage {...messages.maxOptions} values={{ maxNumber: question.attributes.max_options }} />
                {')'}
              </MaxText>
            </QuestionText>
          </Label>
          {options.map((option) => (
            <StyledCheckbox
              className="e2e-poll-option"
              key={option.id}
              onChange={onChange(question.id, option.id)}
              checked={!!value?.includes(option.id)}
              disabled={!value?.includes(option.id) && value?.length === question.attributes.max_options}
              id={option.id}
              label={<T value={option.attributes.title_multiloc} />}
            />
          ))}
        </QuestionContainer>
      )}
    </StyledFieldSet>
  );
};

const Data = adopt<DataProps, InputProps>({
  options: ({ question, render }) => <GetPollOptions questionId={question.id}>{render}</GetPollOptions>
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataprops => <PollSingleChoice {...inputProps} {...dataprops} />}
  </Data>
);
