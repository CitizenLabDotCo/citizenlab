// Libraries
import React from 'react';
import styled from 'styled-components';

// Typings
import { IPollQuestion } from 'services/pollQuestions';

// Components
import Button from 'components/UI/Button';
import { SortableRow, TextCell } from 'components/admin/ResourceList';
import T from 'components/T';

const StyledButton = styled(Button)`display: inline-block`;

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

const QuestionRow = ({ question, isLastItem, index, onDelete, onEdit, onEditOptions, handleDropRow, handleDragRow }: {
  question: IPollQuestion,
  isLastItem: boolean,
  index: number,
  onDelete: () => void,
  onEdit: () => void,
  onEditOptions: () => void,
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
        <StyledButton
          className="e2e-edit-question"
          onClick={onEdit}
          style="text"
          icon="edit"
          ariaLabel="edit"
        />
      </TextCell>

      <Button
        className="e2e-delete-question"
        onClick={onDelete}
        style="text"
        icon="delete"
      >
        <FormattedMessage {...messages.deleteQuestion} />
      </Button>
      <Button
        className="e2e-edit-options"
        onClick={onEditOptions}
        style="secondary"
      >
        <FormattedMessage {...messages.editOptions} />
      </Button>
    </SortableRow>
  );

export default QuestionRow;
