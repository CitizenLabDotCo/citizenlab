import React from 'react';

import { IPollQuestion } from 'services/pollQuestions';

import T from 'components/T';

import Button from 'components/UI/Button';
import { SortableRow, TextCell } from 'components/admin/ResourceList';

const QuestionRow = ({ question, isLastItem, index, onDelete, onEdit, handleDropRow, handleDragRow }: {
  question: IPollQuestion,
  isLastItem: boolean,
  index: number,
  onDelete: (questionId: string) => () => void
  onEdit: (questionId: string) => () => void
  handleDragRow,
  handleDropRow
}) => {
  console.log(question);
  return (
    <SortableRow
      id={question.id}
      className="e2e-question-row"
      index={index}
      lastItem={isLastItem}
      moveRow={handleDragRow}
      dropRow={handleDropRow}
    >
      <TextCell className="expand">
        <T value={question.attributes.title_multiloc} />
      </TextCell>

      <Button
        className="e2e-delete-question"
        onClick={onDelete(question.id)}
        style="text"
        icon="delete"
      >
        Delete
      </Button>

      <Button
        className="e2e-edit-question"
        onClick={onEdit(question.id)}
        style="secondary"
        icon="edit"
      >
        edit
      </Button>
    </SortableRow>
  );
};

export default QuestionRow;
