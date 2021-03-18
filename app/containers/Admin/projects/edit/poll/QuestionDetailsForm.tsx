// Libraries
import React, { PureComponent } from 'react';

// Services / Data loading
import { IPollQuestion, updatePollQuestion } from 'services/pollQuestions';

// Components
import Button from 'components/UI/Button';
import { Row } from 'components/admin/ResourceList';
import { Select, Input } from 'cl2-component-library';
import WrongMaxChoiceIndicator from './WrongMaxChoiceIndicator';

// Typings
import { IOption } from 'typings';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import messages from './messages';

// Style
import styled from 'styled-components';
import { InjectedIntlProps } from 'react-intl';

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

interface InputProps {
  question: IPollQuestion;
}

interface DataProps {}

interface Props extends InputProps, DataProps {}

interface State {
  maxAnswers: number | null;
  questionType: 'single_option' | 'multiple_options';
  typeOptions: IOption[];
}

export class QuestionDetailsForm extends PureComponent<
  Props & InjectedIntlProps,
  State
> {
  typeOptions: IOption[];

  constructor(props: Props & InjectedIntlProps) {
    super(props);
    this.state = {
      maxAnswers: props.question.attributes.max_options,
      questionType: props.question.attributes.question_type,
      typeOptions: [],
    };
  }

  componentDidMount() {
    const { formatMessage } = this.props.intl;
    this.setState({
      typeOptions: [
        {
          label: formatMessage(messages.singleOption),
          value: 'single_option',
        },
        {
          label: formatMessage(messages.multipleOption),
          value: 'multiple_options',
        },
      ],
    });
  }

  changeMaxAnswers = (maxAnswers: string) => {
    this.setState({ maxAnswers: Number(maxAnswers) });
  };

  changeQuestionType = (option: IOption) => {
    const newType = option.value;
    this.setState({
      questionType: newType,
      maxAnswers: newType === 'single_option' ? null : 2,
    });
  };

  validate = () => {
    const { question } = this.props;
    const { questionType, maxAnswers } = this.state;
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

  onSave = () => {
    const { question } = this.props;
    const { diff, isValid } = this.validate();
    if (isValid) {
      updatePollQuestion(question.id, diff);
    }
  };

  render() {
    const { question } = this.props;
    const { maxAnswers, questionType, typeOptions } = this.state;
    const { isValid } = this.validate();
    return (
      <Row>
        <FormContainer>
          <Select
            options={typeOptions}
            value={questionType}
            onChange={this.changeQuestionType}
          />
          {questionType === 'multiple_options' && (
            <StyledInput
              type="number"
              onChange={this.changeMaxAnswers}
              value={String(maxAnswers)}
              min="2"
            />
          )}
        </FormContainer>
        <FormContainer>
          <WrongMaxChoiceIndicator
            questionId={question.id}
            maxAnswers={maxAnswers}
          />
          <Button
            className="e2e-form-question-settings-save"
            buttonStyle="secondary"
            onClick={this.onSave}
            disabled={!isValid}
          >
            <FormattedMessage {...messages.applyQuestionSettings} />
          </Button>
        </FormContainer>
      </Row>
    );
  }
}

export default injectIntl(QuestionDetailsForm);
