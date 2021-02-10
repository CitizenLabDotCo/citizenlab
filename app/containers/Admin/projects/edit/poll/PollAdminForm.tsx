// Libraries
import React, { PureComponent, Fragment } from 'react';
import { DragDropContext } from 'react-dnd-cjs';
import HTML5Backend from 'react-dnd-html5-backend-cjs';
import { isEqual, clone } from 'lodash-es';
import styled from 'styled-components';

// Services / Data loading
import {
  addPollQuestion,
  deletePollQuestion,
  updatePollQuestion,
  reorderPollQuestion,
  IPollQuestion,
} from 'services/pollQuestions';
import { isNilOrError } from 'utils/helperUtils';

// Components
import { List } from 'components/admin/ResourceList';
import Button from 'components/UI/Button';
import QuestionRow from './QuestionRow';
import FormQuestionRow from './FormQuestionRow';
import OptionForm from './OptionForm';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// Typings
import { Multiloc, IParticipationContextType } from 'typings';

const StyledList = styled(List)`
  margin: 10px 0;
`;

interface Props {
  participationContextId: string;
  participationContextType: IParticipationContextType;
  pollQuestions: IPollQuestion[] | null | undefined;
}

interface State {
  newQuestionTitle: Multiloc | null;
  editingQuestionTitle: Multiloc;
  editingQuestionId: string | null;
  editingOptionsId: string | null;
  itemsWhileDragging: IPollQuestion[] | null;
  isProcessing: boolean;
}

export class PollAdminForm extends PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      newQuestionTitle: null,
      editingQuestionId: null,
      editingQuestionTitle: {},
      editingOptionsId: null,
      itemsWhileDragging: null,
      isProcessing: false,
    };
  }

  // Drag and drop handling
  componentDidUpdate(prevProps: Props) {
    const { itemsWhileDragging } = this.state;
    const prevCustomFieldsIds =
      prevProps.pollQuestions &&
      prevProps.pollQuestions.map((customField) => customField.id);
    const nextCustomFieldsIds =
      this.props.pollQuestions &&
      this.props.pollQuestions.map((customField) => customField.id);

    if (
      itemsWhileDragging &&
      !isEqual(prevCustomFieldsIds, nextCustomFieldsIds)
    ) {
      this.setState({ itemsWhileDragging: null });
    }
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
  };

  handleDropRow = (fieldId: string, toIndex: number) => {
    const listItems = this.listItems();

    if (!listItems) return;

    const field = listItems.find((listItem) => listItem.id === fieldId);

    if (field && field.attributes.ordering !== toIndex) {
      this.setState({ isProcessing: true });
      reorderPollQuestion(fieldId, toIndex).then(() =>
        this.setState({ isProcessing: false })
      );
    } else {
      this.setState({ itemsWhileDragging: null });
    }
  };

  listItems = () => {
    const { itemsWhileDragging } = this.state;
    const { pollQuestions } = this.props;
    return itemsWhileDragging || pollQuestions;
  };

  // New question
  startNewQuestion = () => {
    this.setState({ newQuestionTitle: {}, editingOptionsId: null });
  };

  changeNewQuestion = (value) => {
    this.setState({ newQuestionTitle: value });
  };

  saveNewQuestion = () => {
    const { participationContextId, participationContextType } = this.props;
    const { newQuestionTitle } = this.state;

    if (
      participationContextType &&
      participationContextId &&
      newQuestionTitle
    ) {
      addPollQuestion(
        participationContextId,
        participationContextType,
        newQuestionTitle
      ).then((res) => {
        this.setState({
          newQuestionTitle: null,
          editingOptionsId: res.data.id,
        });
      });
    }
  };
  cancelNewQuestion = () => {
    this.setState({ newQuestionTitle: null });
  };

  // Edit question
  editQuestion = (questionId: string, currentTitle: Multiloc) => () => {
    this.setState({
      editingQuestionId: questionId,
      editingQuestionTitle: currentTitle,
      editingOptionsId: null,
    });
  };

  changeEditingQuestion = (value) => {
    this.setState({ editingQuestionTitle: value });
  };

  saveEditingQuestion = () => {
    const { editingQuestionTitle, editingQuestionId } = this.state;
    editingQuestionId &&
      updatePollQuestion(editingQuestionId, {
        title_multiloc: editingQuestionTitle,
      }).then(() => {
        this.setState({ editingQuestionId: null, editingQuestionTitle: {} });
      });
  };
  cancelEditQuestion = () => {
    this.setState({ editingQuestionId: null, editingQuestionTitle: {} });
  };

  // Delete question
  deleteQuestion = (questionId: string) => () => {
    const { participationContextId, participationContextType } = this.props;
    deletePollQuestion(
      questionId,
      participationContextId,
      participationContextType
    );
  };

  // Option edition
  editOptions = (questionId) => () => {
    this.setState({ editingOptionsId: questionId });
  };

  closeEditingOptions = () => {
    this.setState({ editingOptionsId: null });
  };

  render() {
    const listItems = this.listItems() || [];
    const {
      newQuestionTitle,
      editingQuestionId,
      editingQuestionTitle,
      editingOptionsId,
    } = this.state;
    return (
      <>
        <StyledList key={listItems.length + (newQuestionTitle ? 1 : 0)}>
          {!isNilOrError(listItems) &&
            listItems.map((question, index) => (
              <Fragment key={question.id}>
                {editingQuestionId === question.id ? (
                  <FormQuestionRow
                    titleMultiloc={editingQuestionTitle}
                    onChange={this.changeEditingQuestion}
                    onSave={this.saveEditingQuestion}
                    onCancel={this.cancelEditQuestion}
                  />
                ) : editingOptionsId === question.id ? (
                  <OptionForm
                    question={question}
                    collapse={this.closeEditingOptions}
                  />
                ) : (
                  <QuestionRow
                    question={question}
                    isLastItem={
                      index === listItems.length - 1 && !newQuestionTitle
                    }
                    index={index}
                    onDelete={this.deleteQuestion(question.id)}
                    onEdit={this.editQuestion(
                      question.id,
                      question.attributes.title_multiloc
                    )}
                    onEditOptions={this.editOptions(question.id)}
                    handleDragRow={this.handleDragRow}
                    handleDropRow={this.handleDropRow}
                  />
                )}
              </Fragment>
            ))}
          {newQuestionTitle && (
            <FormQuestionRow
              key="new"
              titleMultiloc={newQuestionTitle}
              onChange={this.changeNewQuestion}
              onSave={this.saveNewQuestion}
              onCancel={this.cancelNewQuestion}
            />
          )}
        </StyledList>
        {!newQuestionTitle && !editingOptionsId && (
          <Button
            className="e2e-add-question-btn"
            buttonStyle="cl-blue"
            icon="plus-circle"
            onClick={this.startNewQuestion}
          >
            <FormattedMessage {...messages.addPollQuestion} />
          </Button>
        )}
      </>
    );
  }
}

export default DragDropContext(HTML5Backend)(PollAdminForm);
