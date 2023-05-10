// Libraries
import React, { useState, Fragment } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { clone } from 'lodash-es';
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
import QuestionFormRow from './QuestionFormRow';
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

const PollAdminForm = ({
  participationContextId,
  participationContextType,
  pollQuestions,
}: Props) => {
  const [newQuestionTitle, setNewQuestionTitle] = useState<Multiloc | null>(
    null
  );
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(
    null
  );
  const [editingQuestionTitle, setEditingQuestionTitle] =
    useState<Multiloc | null>(null);
  const [editingOptionsId, setEditingOptionsId] = useState<string | null>(null);
  const [itemsWhileDragging, setItemsWhileDragging] = useState<
    IPollQuestion[] | null
  >(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // TO DO: componentDidUpdate

  const handleDragRow = (fromIndex: number, toIndex: number) => {
    if (!isProcessing) {
      const listItems = getListItems();

      if (!listItems) return;

      const itemsWhileDragging = clone(listItems);
      itemsWhileDragging.splice(fromIndex, 1);
      itemsWhileDragging.splice(toIndex, 0, listItems[fromIndex]);
      setItemsWhileDragging(itemsWhileDragging);
    }
  };

  const handleDropRow = (fieldId: string, toIndex: number) => {
    const listItems = getListItems();

    if (!listItems) return;

    const field = listItems.find((listItem) => listItem.id === fieldId);

    if (field && field.attributes.ordering !== toIndex) {
      setIsProcessing(true);
      reorderPollQuestion(fieldId, toIndex).then(() => setIsProcessing(false));
    } else {
      setItemsWhileDragging(null);
    }
  };

  const getListItems = () => {
    return itemsWhileDragging || pollQuestions;
  };

  // New question
  const startNewQuestion = () => {
    setNewQuestionTitle({});
    setEditingOptionsId(null);
  };

  const changeNewQuestion = (value: Multiloc) => {
    setNewQuestionTitle(value);
  };

  const saveNewQuestion = () => {
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
        setNewQuestionTitle(null);
        setEditingOptionsId(res.data.id);
      });
    }
  };
  const cancelNewQuestion = () => {
    setNewQuestionTitle(null);
  };

  // Edit question
  const editQuestion = (questionId: string, currentTitle: Multiloc) => () => {
    setEditingQuestionId(questionId);
    setEditingQuestionTitle(currentTitle);
    setEditingOptionsId(null);
  };
  w;

  const changeEditingQuestion = (value: Multiloc) => {
    setEditingQuestionTitle(value);
  };

  const saveEditingQuestion = () => {
    if (editingQuestionId && editingQuestionTitle) {
      updatePollQuestion(editingQuestionId, {
        title_multiloc: editingQuestionTitle,
      }).then(() => {
        setEditingQuestionId(null);
        setEditingQuestionTitle(null);
      });
    }
  };

  const cancelEditQuestion = () => {
    setEditingQuestionId(null);
    setEditingQuestionTitle(null);
  };

  // Delete question
  const deleteQuestion = (questionId: string) => () => {
    deletePollQuestion(
      questionId,
      participationContextId,
      participationContextType
    );
  };

  // Option edition
  const editOptions = (questionId: string) => () => {
    setEditingOptionsId(questionId);
  };

  const closeEditingOptions = () => {
    setEditingOptionsId(null);
  };

  const listItems = getListItems() || [];

  return (
    <>
      <StyledList key={listItems.length + (newQuestionTitle ? 1 : 0)}>
        {!isNilOrError(listItems) &&
          listItems.map((question, index) => (
            <Fragment key={question.id}>
              {editingQuestionId === question.id && editingQuestionTitle ? (
                <QuestionFormRow
                  titleMultiloc={editingQuestionTitle}
                  onChange={changeEditingQuestion}
                  onSave={saveEditingQuestion}
                  onCancel={cancelEditQuestion}
                />
              ) : editingOptionsId === question.id ? (
                <OptionForm
                  question={question}
                  collapse={closeEditingOptions}
                />
              ) : (
                <QuestionRow
                  question={question}
                  isLastItem={
                    index === listItems.length - 1 && !newQuestionTitle
                  }
                  index={index}
                  onDelete={deleteQuestion(question.id)}
                  onEdit={editQuestion(
                    question.id,
                    question.attributes.title_multiloc
                  )}
                  onEditOptions={editOptions(question.id)}
                  handleDragRow={handleDragRow}
                  handleDropRow={handleDropRow}
                />
              )}
            </Fragment>
          ))}
        {newQuestionTitle && (
          <QuestionFormRow
            key="new"
            titleMultiloc={newQuestionTitle}
            onChange={changeNewQuestion}
            onSave={saveNewQuestion}
            onCancel={cancelNewQuestion}
          />
        )}
      </StyledList>
      {!newQuestionTitle && !editingOptionsId && (
        <Button
          className="e2e-add-question-btn"
          buttonStyle="cl-blue"
          icon="plus-circle"
          onClick={startNewQuestion}
        >
          <FormattedMessage {...messages.addPollQuestion} />
        </Button>
      )}
    </>
  );
};

export default (props: Props) => (
  <DndProvider backend={HTML5Backend}>
    <PollAdminForm {...props} />
  </DndProvider>
);
