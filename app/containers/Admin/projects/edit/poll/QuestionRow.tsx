// Libraries
import React from 'react';

// Services & Resources
import { IPollQuestion } from 'services/pollQuestions';

// Components
import Button from 'components/UI/Button';
import { SortableRow, TextCell } from 'components/admin/ResourceList';

import T from 'components/T';

import styled from 'styled-components';

// Inline block so the button acts as a character and is stuck to the end of the title to make it clear it will edit the title text
const EditTitleButton = styled(Button)`
  display: inline-block;
`;

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import WrongOptionsIndicator from './WrongOptionsIndicator';

const QuestionRow = ({
  question,
  isLastItem,
  index,
  onDelete,
  onEdit,
  onEditOptions,
  handleDropRow,
  handleDragRow,
}: {
  question: IPollQuestion;
  isLastItem: boolean;
  index: number;
  onDelete: () => void;
  onEdit: () => void;
  onEditOptions: () => void;
  handleDragRow;
  handleDropRow;
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
      <EditTitleButton
        className="e2e-edit-question"
        onClick={onEdit}
        buttonStyle="text"
        icon="edit"
        ariaLabel="edit"
      />
    </TextCell>

    <WrongOptionsIndicator questionId={question.id} />

    <Button
      className="e2e-delete-question"
      onClick={onDelete}
      buttonStyle="text"
      icon="delete"
    >
      <FormattedMessage {...messages.deleteQuestion} />
    </Button>
    <Button
      className="e2e-edit-options"
      onClick={onEditOptions}
      buttonStyle="secondary"
    >
      <FormattedMessage {...messages.editPollAnswersButtonLabel} />
    </Button>
  </SortableRow>
);

export default QuestionRow;
