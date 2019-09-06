import React, { PureComponent, Fragment } from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import { GetPollQuestionsChildProps } from 'resources/GetPollQuestions';
import { addPollQuestion, deletePollQuestion, updatePollQuestion } from 'services/pollQuestions';
import { isNilOrError } from 'utils/helperUtils';

import { List } from 'components/admin/ResourceList';
import Button from 'components/UI/Button';
import QuestionRow from './QuestionRow';
import FormQuestionRow from './FormQuestionRow';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

import { Multiloc, Locale } from 'typings';

interface Props {
  id: string;
  type: 'projects' | 'phases';
  pollQuestions: GetPollQuestionsChildProps;
  locale: Locale;
}

interface State {
  newQuestionTitle: Multiloc | null;
  editingQuestionTitle: Multiloc;
  editingQuestionId: string | null;
  editingOptionsId: string | null;
}

class PollAdminFormWrapper extends PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      newQuestionTitle: null,
      editingQuestionId: null,
      editingQuestionTitle: {},
      editingOptionsId: null
    };
  }
  startNewQuestion = () => {
    this.setState({ newQuestionTitle: {} });
  }

  changeNewQuestion = (value) => {
    this.setState({ newQuestionTitle: value });
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
  changeEditingQuestion = (value) => {
    this.setState({ editingQuestionTitle: value });
  }

  saveEditingQuestion = () => {
    const { editingQuestionTitle, editingQuestionId } = this.state;
    editingQuestionId && updatePollQuestion(editingQuestionId, editingQuestionTitle).then(() => {
      this.setState({ editingQuestionId: null, editingQuestionTitle: {} });
    });
  }
  editQuestion = (questionId: string, currentTitle: Multiloc) => () => {
    this.setState({ editingQuestionId: questionId, editingQuestionTitle: currentTitle });
  }
  deleteQuestion = (questionId: string) => () => {
    const { id, type } = this.props;
    deletePollQuestion(questionId, id, type);
  }
  handleDragRow = () => { };
  handleDropRow = () => { };

  render() {
    const { pollQuestions, locale } = this.props;
    const { newQuestionTitle, editingQuestionId, editingQuestionTitle } = this.state;

    return (
      <>
        <List>
          {!isNilOrError(pollQuestions) && pollQuestions.map((question, index) => (
            <Fragment key={question.id}>
              {editingQuestionId === question.id ? (
                <FormQuestionRow
                  id={question.id}
                  titleMultiloc={editingQuestionTitle}
                  onChange={this.changeEditingQuestion}
                  onSave={this.saveEditingQuestion}
                  locale={locale}
                />
              ) : (
                  <QuestionRow
                    question={question}
                    isLastItem={index === pollQuestions.length - 1 && !newQuestionTitle}
                    index={index}
                    onDelete={this.deleteQuestion}
                    onEdit={this.editQuestion}
                    handleDragRow={this.handleDragRow}
                    handleDropRow={this.handleDropRow}
                  />
                )}
            </Fragment>
          ))}
          <Fragment key="new">
            {newQuestionTitle &&
              <FormQuestionRow
                titleMultiloc={newQuestionTitle}
                onChange={this.changeNewQuestion}
                onSave={this.saveNewQuestion}
                locale={locale}
              />
            }
          </Fragment>
        </List>
        {!!editingQuestionId || !newQuestionTitle &&
          <Button
            className="e2e-add-question-btn"
            style="cl-blue"
            icon="plus-circle"
            onClick={this.startNewQuestion}
          >
            <FormattedMessage {...messages.addQuestion} />
          </Button>
        }
      </>
    );
  }
}

export default DragDropContext(HTML5Backend)(PollAdminFormWrapper);
