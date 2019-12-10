import React, { PureComponent } from 'react';
import { isNilOrError } from 'utils/helperUtils';

import { IParticipationContextType } from 'typings';

import Button from 'components/UI/Button';

import { IPollQuestion } from 'services/pollQuestions';
import { addPollResponse } from 'services/pollResponses';

import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import PollSingleChoice from './PollSingleChoice';
import PollMultipleChoice from './PollMultipleChoice';

const PollContainer = styled.div`
  color: ${({ theme }) => theme.colorText};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export const QuestionContainer = styled.div`
  background-color: white;
  box-shadow: 1px 2px 2px rgba(0, 0, 0, 0.05);
  border-radius: 3px;
  padding: 20px;
  width: 100%;
  margin-bottom: 10px;
`;

export const QuestionNumber = styled.span`
  font-size: ${fontSizes.medium}px;
  line-height: ${fontSizes.medium}px;
  font-weight: 700;
  background-color: ${colors.background};
  padding: 2px 7px;
  border-radius: 2px;
  margin-right: 15px;
`;

export const Label = styled.label`
  display: flex;
  align-items: center;
  flex-direction: row;
  margin-bottom: 25px;
`;

export const QuestionText = styled.span`
  font-size: ${fontSizes.large}px;
  font-weight: 700;
`;

interface Props {
  questions: IPollQuestion[];
  projectId: string;
  id: string;
  type: IParticipationContextType;
  disabled: boolean;
}

interface State {
  answers: {
    [questionId: string]: string[];
  };
}

class PollForm extends PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      answers: {},
    };
  }

  changeAnswerSingle = (questionId: string, optionId: string) => () => {
    this.setState(state => ({ answers: { ...state.answers, [questionId]: [optionId] } }));
  }
  changeAnswerMultiple = (questionId: string, optionId: string) => () => {
    this.setState(state => {
      const oldAnswer = state.answers[questionId] || [];
      let newOptions;
      if (oldAnswer.includes(optionId)) {
        const anSet = new Set(oldAnswer);
        anSet.delete(optionId);
        newOptions = [...anSet];
      } else {
        newOptions = [...new Set([...oldAnswer, optionId])];
      }

      return ({ answers: { ...state.answers, [questionId]: newOptions } });
    });
  }

  sendAnswer = () => {
    const { id, type, projectId } = this.props;
    const { answers } = this.state;
    if (this.validate()) {
      addPollResponse(id, type, Object.values(answers).flat(), projectId);
    }
  }

  validate = () => {
    const { answers } = this.state;
    const { questions, disabled } = this.props;
    return !disabled
    && questions.every(question => typeof (answers[question.id] || [])[0] === 'string')
    && questions.filter(question => question.attributes.question_type === 'multiple_options')
      .every(question =>  question.attributes.max_options && answers[question.id].length <= question.attributes.max_options);
  }

  //

  render() {
    const { answers } = this.state;
    const { questions } = this.props;
    if (isNilOrError(questions) || questions.length === 0) return null;
    const isValid = this.validate();

    return (
      <>
        <PollContainer className="e2e-poll-form">
          {questions.map((question, questionIndex) => question.attributes.question_type === 'single_option' ? (
            <PollSingleChoice
              key={questionIndex}
              question={question}
              index={questionIndex}
              value={(answers[question.id] || [])[0]}
              onChange={this.changeAnswerSingle}
            />
          ) : (
              <PollMultipleChoice
                key={questionIndex}
                question={question}
                index={questionIndex}
                value={answers[question.id]}
                onChange={this.changeAnswerMultiple}
              />
            ))}
        </PollContainer>
        <Button
          onClick={this.sendAnswer}
          disabled={!isValid}
          className="e2e-send-poll"
        >
          <FormattedMessage {...messages.sendAnswer} />
        </Button>
      </>
    );
  }

}

export default PollForm;
