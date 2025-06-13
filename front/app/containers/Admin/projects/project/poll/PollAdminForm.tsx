import React, { useState, Fragment } from 'react';

import { clone } from 'lodash-es';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import styled from 'styled-components';
import { Multiloc } from 'typings';

import { IPollQuestionData } from 'api/poll_questions/types';
import useAddPollQuestion from 'api/poll_questions/useAddPollQuestion';
import useDeletePollQuestion from 'api/poll_questions/useDeletePollQuestion';
import useReorderPollQuestion from 'api/poll_questions/useReorderPollQuestion';
import useUpdatePollQuestion from 'api/poll_questions/useUpdatePollQuestion';

import { List } from 'components/admin/ResourceList';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import messages from './messages';
import OptionForm from './PollAnswerOptions/OptionForm';
import QuestionFormRow from './PollQuestions/QuestionFormRow';
import QuestionRow from './PollQuestions/QuestionRow';

const StyledList = styled(List)`
  margin: 10px 0;
`;

interface Props {
  phaseId: string;
  pollQuestions: IPollQuestionData[] | null | undefined;
}

const PollAdminForm = ({ phaseId, pollQuestions }: Props) => {
  const { mutate: addPollQuestion } = useAddPollQuestion();
  const { mutate: deletePollQuestion } = useDeletePollQuestion();
  const { mutate: updatePollQuestion } = useUpdatePollQuestion();
  const { mutate: reorderPollQuestion, isLoading } = useReorderPollQuestion();
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
    IPollQuestionData[] | null
  >(null);

  const handleDragRow = (fromIndex: number, toIndex: number) => {
    if (!isLoading) {
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
      reorderPollQuestion({
        questionId: fieldId,
        ordering: toIndex,
        phaseId,
      });
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
    if (phaseId && newQuestionTitle) {
      addPollQuestion(
        {
          phaseId,
          title_multiloc: newQuestionTitle,
        },
        {
          onSuccess: (res) => {
            setNewQuestionTitle(null);
            setEditingOptionsId(res.data.id);
          },
        }
      );
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

  const changeEditingQuestion = (value: Multiloc) => {
    setEditingQuestionTitle(value);
  };

  const saveEditingQuestion = () => {
    if (editingQuestionId && editingQuestionTitle) {
      updatePollQuestion(
        {
          questionId: editingQuestionId,
          title_multiloc: editingQuestionTitle,
          phaseId,
        },
        {
          onSuccess: () => {
            setEditingQuestionId(null);
            setEditingQuestionTitle(null);
          },
        }
      );
    }
  };

  const cancelEditQuestion = () => {
    setEditingQuestionId(null);
    setEditingQuestionTitle(null);
  };

  // Delete question
  const deleteQuestion = (questionId: string) => () => {
    deletePollQuestion({
      questionId,
      phaseId,
    });
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
        <ButtonWithLink
          className="e2e-add-question-btn"
          buttonStyle="admin-dark"
          icon="plus-circle"
          onClick={startNewQuestion}
        >
          <FormattedMessage {...messages.addPollQuestion} />
        </ButtonWithLink>
      )}
    </>
  );
};

export default (props: Props) => (
  <DndProvider backend={HTML5Backend}>
    <PollAdminForm {...props} />
  </DndProvider>
);
