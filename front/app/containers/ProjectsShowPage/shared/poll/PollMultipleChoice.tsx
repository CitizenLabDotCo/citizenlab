import React from 'react';
import { IPollQuestion } from 'services/pollQuestions';
import styled from 'styled-components';
import Checkbox from 'components/UI/Checkbox';
import {
  QuestionContainer,
  Question,
  QuestionNumber,
  QuestionText,
} from './PollForm';
import { isNilOrError } from 'utils/helperUtils';
import T from 'components/T';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import usePollOptions from 'api/poll_options/usePollOptions';

const StyledFieldSet = styled.fieldset`
  width: 100%;
  border: none;
  padding: 0;
  margin: 0;
  margin-bottom: 18px;
`;

const StyledCheckbox = styled(Checkbox)`
  margin: 5px;
  margin-left: 35px;
`;

const MaxText = styled.span`
  font-weight: 400;
`;

interface Props {
  question: IPollQuestion;
  index: number;
  value: string[] | undefined;
  disabled: boolean;
  onChange: (questionId: string, optionId: string) => () => void;
}

const PollMultipleChoice = ({
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
              <MaxText>
                {' ('}
                <FormattedMessage
                  {...messages.maxOptions}
                  values={{ maxNumber: question.attributes.max_options }}
                />
                {')'}
              </MaxText>
            </QuestionText>
          </Question>
          {options.data.map((option) => (
            <StyledCheckbox
              className="e2e-poll-option"
              key={option.id}
              onChange={onChange(question.id, option.id)}
              checked={!!value?.includes(option.id)}
              disabled={
                disabled === true ||
                (!value?.includes(option.id) &&
                  value?.length === question.attributes.max_options)
              }
              label={<T value={option.attributes.title_multiloc} />}
            />
          ))}
        </QuestionContainer>
      )}
    </StyledFieldSet>
  );
};

export default PollMultipleChoice;
