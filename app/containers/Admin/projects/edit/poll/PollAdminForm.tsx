import React, { PureComponent } from 'react';
import { GetPollQuestionsChildProps } from 'resources/GetPollQuestions';
import { addPollQuestion, deletePollQuestion } from 'services/pollQuestions';
import { List, TextCell, Row } from 'components/admin/ResourceList';
import Button from 'components/UI/Button';
import T from 'components/T';
import { ButtonWrapper } from 'components/admin/PageWrapper';
import { isNilOrError } from 'utils/helperUtils';
import { Multiloc, Locale } from 'typings';
import InputMultiloc from 'components/UI/InputMultiloc';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import QuestionRow from './QuestionRow';
import FormLocaleSwitcher from 'components/admin/FormLocaleSwitcher';

interface Props {
  id: string;
  type: 'projects' | 'phases';
  pollQuestions: GetPollQuestionsChildProps;
  locale: Locale;
}

interface State {
  newQuestionTitle: Multiloc | null;
  editingQuestion: string | null;
  shownLocale: Locale;
}

class PollAdminFormWrapper extends PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      newQuestionTitle: null,
      editingQuestion: null,
      shownLocale: props.locale
    };
  }

  changeNewQuestion = (value) => {
    this.setState({ newQuestionTitle: value });
  }

  startNewQuestion = () => {
    this.setState({ newQuestionTitle: {} });
  }

  saveNewQuestion = () => {
    const { id, type } = this.props;
    const { newQuestionTitle } = this.state;
    const participationContextType = type === 'projects'
      ? 'Project'
      : type === 'phases'
        ? 'Phase'
        : null;
    participationContextType && newQuestionTitle && addPollQuestion(id, participationContextType, newQuestionTitle).then((res) => {
      this.setState({ newQuestionTitle: null });
    });
  }
  editQuestion = (questionId: string) => () => {
    this.setState({ editingQuestion: questionId });
  }
  deleteQuestion = (questionId: string) => () => {
    const { id, type } = this.props;
    deletePollQuestion(questionId, id, type);
  }
  handleDragRow = () => { };
  handleDropRow = () => { };

  onChangeLocale = (shownLocale: Locale) => () => {
    this.setState({ shownLocale });
  }

  render() {
    const { pollQuestions } = this.props;
    const { newQuestionTitle, editingQuestion, shownLocale } = this.state;

    return (
      <>
        <List>
          {!isNilOrError(pollQuestions) && pollQuestions.map((question, index) => (
            <QuestionRow
              key={question.id}
              question={question}
              isLastItem={index === pollQuestions.length - 1 && !newQuestionTitle}
              index={index}
              onDelete={this.deleteQuestion}
              onEdit={this.editQuestion}
              handleDragRow={this.handleDragRow}
              handleDropRow={this.handleDropRow}
            />
          ))}
          {newQuestionTitle &&
            <Row
              key="new"
              id="new"
              className="e2e-new-question-row"
            >
              <TextCell>
              {shownLocale &&
                <FormLocaleSwitcher
                  onLocaleChange={this.onChangeLocale}
                  selectedLocale={shownLocale}
                  values={{ newQuestionTitle }}
                />
              }
              </TextCell>
              <TextCell className="expand">
                <InputMultiloc
                  valueMultiloc={newQuestionTitle}
                  type="text"
                  onChange={this.changeNewQuestion}
                  shownLocale={shownLocale}
                />
              </TextCell>

              <Button
                className="e2e-save-question"
                style="secondary"
                icon="edit"
                onClick={this.saveNewQuestion}
              >
                save
              </Button>
            </Row>
          }
        </List>
        {!!editingQuestion || !newQuestionTitle &&
          <Button
            className="e2e-add-question-btn"
            style="cl-blue"
            icon="plus-circle"
            onClick={this.startNewQuestion}
          >
          add
          </Button>
        }
      </>
    );
  }
}

export default DragDropContext(HTML5Backend)(PollAdminFormWrapper);
