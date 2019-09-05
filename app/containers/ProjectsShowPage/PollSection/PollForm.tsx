import React, { PureComponent } from 'react';

import Radio from 'components/UI/Radio';
import T from 'components/T';

import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';

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
  questions: IPollQuestion;
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
      answers: {}
    };
  }

  changeAnswer = (questionId: string, optionId: string) => () => {
    this.setState(state => ({ answers: { ...state.answers, [questionId]: optionId } }));
  }

  render() {
    return (
      <>
        {this.props.questions.map((question, index) => (
          <QuestionContainer key={question.id}>
            <Label>
              <QuestionNumber>
                {index + 1}
              </QuestionNumber>
              <QuestionText>
                <T value={question.attributes.title_multiloc} />
              </QuestionText>
            </Label>
            {question.relationships.options.data.map(option => (
              <StyledRadio
                key={option.id}
                onChange={this.changeAnswer(question.id, option.id)}
                currentValue={this.state.answers[question.id]}
                value={option.id}
                name={option.id}
                id={option.id}
                label={<T value={option.attributes.title_multiloc} />}
              />
            ))}
          </QuestionContainer>
        ))}
      </>
    );
  }

}

export default PollForm;
