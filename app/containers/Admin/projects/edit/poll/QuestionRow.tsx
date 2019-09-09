import React from 'react';

import { IPollQuestion } from 'services/pollQuestions';

import T from 'components/T';

import Button from 'components/UI/Button';
import { SortableRow, TextCell } from 'components/admin/ResourceList';
import { Multiloc } from 'typings';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

const QuestionRow = ({ question, isLastItem, index, onDelete, onEdit, onEditOptions, handleDropRow, handleDragRow }: {
  question: IPollQuestion,
  isLastItem: boolean,
  index: number,
  onDelete: (questionId: string) => () => void,
  onEdit: (questionId: string, currentTitle: Multiloc) => () => void,
  onEditOptions: (questionId: string) => () => void,
  handleDragRow,
  handleDropRow
}) => (
    <SortableRow
      key={question.id}
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
        <FormattedMessage {...messages.deleteQuestion} />
      </Button>

      <Button
        className="e2e-edit-question"
        onClick={onEdit(question.id, question.attributes.title_multiloc)}
        style="secondary"
        icon="edit"
      >
        <FormattedMessage {...messages.editQuestion} />
      </Button>
      <Button
        className="e2e-edit-options"
        onClick={onEditOptions(question.id)}
        style="secondary"
        icon="create"
      >
        <FormattedMessage {...messages.editOptions} />
      </Button>
    </SortableRow>
  );

export default QuestionRow;
