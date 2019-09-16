import React, { PureComponent } from 'react';
import { isNilOrError } from 'utils/helperUtils';

import Radio from 'components/UI/Radio';
import Button from 'components/UI/Button';

import T from 'components/T';

import { IPollQuestion } from 'services/pollQuestions';
import { addPollResponse } from 'services/pollResponses';
import GetPollOptions, { GetPollOptionsChildProps } from 'resources/GetPollOptions';

import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

const PollContainer = styled.div`
  color: ${({ theme }) => theme.colorText};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const QuestionContainer = styled.div`
  background-color: white;
  box-shadow: 1px 2px 2px rgba(0, 0, 0, 0.05);
  border-radius: 3px;
  padding: 20px;
  width: 100%;
  margin-bottom: 10px;
`;

const QuestionNumber = styled.span`
  font-size: ${fontSizes.medium}px;
  line-height: ${fontSizes.medium}px;
  font-weight: 700;
  background-color: ${colors.background};
  padding: 2px 7px;
  border-radius: 2px;
  margin-right: 15px;
`;

const Label = styled.label`
  display: flex;
  align-items: center;
  flex-direction: row;
  margin-bottom: 25px;
`;

const QuestionText = styled.span`
  font-size: ${fontSizes.large}px;
  font-weight: 700;
`;

const StyledRadio = styled(Radio)`
  margin-left: 35px;
`;

interface Props {
  questions: IPollQuestion[];
  projectId: string;
  id: string;
  type: 'projects' | 'phases';
  disabled: boolean;
}

interface State {
  answers: {
    [questionId: string]: string;
  };
}

class PollForm extends PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      answers: {},
    };
  }

  changeAnswer = (questionId: string, optionId: string) => () => {
    this.setState(state => ({ answers: { ...state.answers, [questionId]: optionId } }));
  }

  sendAnswer = () => {
    const { id, type, projectId } = this.props;
    const { answers } = this.state;
    if (this.validate()) {
      addPollResponse(id, type, Object.values(answers), projectId);
    }
  }

  validate = () => {
    const { answers } = this.state;
    const { questions, disabled } = this.props;
    return !disabled && questions.every(question => !!answers[question.id]);
  }

  render() {
    const { answers } = this.state;
    const { questions } = this.props;
    return (
      <>
      <PollContainer className="e2e-poll-form">
        {questions.map((question, questionIndex) => (
          <QuestionContainer key={question.id} className="e2e-poll-question">
            <Label>
              <QuestionNumber>
                {questionIndex + 1}
              </QuestionNumber>
              <QuestionText>
                <T value={question.attributes.title_multiloc} />
              </QuestionText>
            </Label>
            <GetPollOptions questionId={question.id}>
              {(options: GetPollOptionsChildProps) => (
                isNilOrError(options) ? null : (
                  <>
                    {options.map((option, optionIndex) => (
                      <StyledRadio
                        className="e2e-poll-option"
                        key={option.id}
                        onChange={this.changeAnswer(question.id, option.id)}
                        currentValue={answers[question.id]}
                        value={option.id}
                        name={option.id}
                        id={option.id}
                        label={<T value={option.attributes.title_multiloc} />}
                        autoFocus={questionIndex === 0 && optionIndex === 0}
                      />
                    ))}
                  </>
                ))}
            </GetPollOptions>
          </QuestionContainer>
        ))}
        </PollContainer>
        <Button
          onClick={this.sendAnswer}
          disabled={!this.validate()}
          className="e2e-send-poll"
        >
          <FormattedMessage {...messages.sendAnswer} />
        </Button>
      </>
    );
  }

}

export default PollForm;
