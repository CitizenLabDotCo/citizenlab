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
import { Box } from '@citizenlab/cl2-component-library';

interface Props {
  question: IPollQuestion;
  isLastItem: boolean;
  index: number;
  onDelete: () => void;
  onEdit: () => void;
  onEditOptions: () => void;
  handleDragRow: (fromIndex: number, toIndex: number) => void;
  handleDropRow: (fieldId: string, toIndex: number) => void;
}

const QuestionRow = ({
  question,
  isLastItem,
  index,
  onDelete,
  onEdit,
  onEditOptions,
  handleDropRow,
  handleDragRow,
}: Props) => (
  <SortableRow
    key={question.id}
    id={question.id}
    className="e2e-question-row"
    index={index}
    isLastItem={isLastItem}
    moveRow={handleDragRow}
    dropRow={handleDropRow}
  >
    <TextCell className="expand">
      <Box display="flex" alignItems="center">
        <T value={question.attributes.title_multiloc} />
        <EditTitleButton
          className="e2e-edit-question"
          onClick={onEditOptions}
          buttonStyle="text"
          icon="edit"
          ariaLabel="edit"
        >
          <FormattedMessage {...messages.editPollAnswersButtonLabel} />
        </EditTitleButton>
      </Box>
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
      onClick={onEdit}
      buttonStyle="secondary"
      icon="edit"
    >
      <FormattedMessage {...messages.editPollQuestion} />
    </Button>
  </SortableRow>
);

export default QuestionRow;
