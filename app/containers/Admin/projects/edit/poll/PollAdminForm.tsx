import React, { PureComponent, Fragment } from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { isEqual, clone } from 'lodash-es';

import { addPollQuestion, deletePollQuestion, updatePollQuestion, reorderPollQuestion, IPollQuestion } from 'services/pollQuestions';
import { isNilOrError } from 'utils/helperUtils';

import { List } from 'components/admin/ResourceList';
import Button from 'components/UI/Button';
import QuestionRow from './QuestionRow';
import FormQuestionRow from './FormQuestionRow';
import OptionForm from './OptionForm';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

import { Multiloc, Locale } from 'typings';

interface Props {
  pcId: string;
  pcType: 'projects' | 'phases';
  pollQuestions: IPollQuestion[] | null | undefined;
  locale: Locale;
}

interface State {
  newQuestionTitle: Multiloc | null;
  editingQuestionTitle: Multiloc;
  editingQuestionId: string | null;
  editingOptionsId: string | null;
  itemsWhileDragging: IPollQuestion[] | null;
  isProcessing: boolean;
}

class PollAdminFormWrapper extends PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      newQuestionTitle: null,
      editingQuestionId: null,
      editingQuestionTitle: {},
      editingOptionsId: null,
      itemsWhileDragging: null,
      isProcessing: false
    };
  }

  componentDidUpdate(prevProps: Props) {
    const { itemsWhileDragging } = this.state;
    const prevCustomFieldsIds = (prevProps.pollQuestions && prevProps.pollQuestions.map(customField => customField.id));
    const nextCustomFieldsIds = (this.props.pollQuestions && this.props.pollQuestions.map(customField => customField.id));

    if (itemsWhileDragging && !isEqual(prevCustomFieldsIds, nextCustomFieldsIds)) {
      this.setState({ itemsWhileDragging: null });
    }
  }

  startNewQuestion = () => {
    this.setState({ newQuestionTitle: {} });
  }

  changeNewQuestion = (value) => {
    this.setState({ newQuestionTitle: value });
  }

  saveNewQuestion = () => {
    const { pcId, pcType } = this.props;
    const { newQuestionTitle } = this.state;
    const participationContextType = pcType === 'projects'
      ? 'Project'
      : pcType === 'phases'
        ? 'Phase'
        : null;
    participationContextType && newQuestionTitle && addPollQuestion(pcId, participationContextType, newQuestionTitle).then((res) => {
      this.setState({ newQuestionTitle: null, editingOptionsId: res.data.id });
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
    const { pcId, pcType } = this.props;
    deletePollQuestion(questionId, pcId, pcType);
  }

  handleDragRow = (fromIndex, toIndex) => {
    if (!this.state.isProcessing) {
      const listItems = this.listItems();

      if (!listItems) return;

      const itemsWhileDragging = clone(listItems);
      itemsWhileDragging.splice(fromIndex, 1);
      itemsWhileDragging.splice(toIndex, 0, listItems[fromIndex]);
      this.setState({ itemsWhileDragging });
    }
  }

  handleDropRow = (fieldId: string, toIndex: number) => {
    const listItems = this.listItems();

    if (!listItems) return;

    const field = listItems.find(listItem => listItem.id === fieldId);

    if (field && field.attributes.ordering !== toIndex) {
      this.setState({ isProcessing: true });
      reorderPollQuestion(fieldId, toIndex).then(() => this.setState({ isProcessing: false }));
    } else {
      this.setState({ itemsWhileDragging: null });
    }
  }

  listItems = () => {
    const { itemsWhileDragging } = this.state;
    const { pollQuestions } = this.props;
    return (itemsWhileDragging || pollQuestions);
  }

  editOptions = (questionId) => () => {
    this.setState({ editingOptionsId: questionId });
  }
  closeEditingOptions = () => {
    this.setState({ editingOptionsId: null });
  }

  render() {
    const listItems = this.listItems() || [];

    const { locale } = this.props;
    const { newQuestionTitle, editingQuestionId, editingQuestionTitle, editingOptionsId } = this.state;

    return (
      <>
        <List key={listItems.length}>
          {!isNilOrError(listItems) && listItems.map((question, index) => (
            <Fragment key={question.id}>
              {editingQuestionId === question.id ? (
                <FormQuestionRow
                  id={question.id}
                  titleMultiloc={editingQuestionTitle}
                  onChange={this.changeEditingQuestion}
                  onSave={this.saveEditingQuestion}
                  locale={locale}
                />
              ) : editingOptionsId === question.id ? (
                <OptionForm
                  question={question}
                  collapse={this.closeEditingOptions}
                  locale={locale}
                />
              ) : (
                  <QuestionRow
                    question={question}
                    isLastItem={index === listItems.length - 1 && !newQuestionTitle}
                    index={index}
                    onDelete={this.deleteQuestion}
                    onEdit={this.editQuestion}
                    onEditOptions={this.editOptions}
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
