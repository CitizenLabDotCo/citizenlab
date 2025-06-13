import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { IPollQuestionData } from 'api/poll_questions/types';

import { TextCell } from 'components/admin/ResourceList';
import SortableRow from 'components/admin/ResourceList/SortableRow';
import T from 'components/T';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';

import WrongOptionsIndicator from './WrongOptionsIndicator';

// Inline block so the button acts as a character and is stuck to the end of the title to make it clear it will edit the title text
const EditTitleButton = styled(ButtonWithLink)`
  display: inline-block;
`;

interface Props {
  question: IPollQuestionData;
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
    dataTestid="question-row"
    index={index}
    isLastItem={isLastItem}
    moveRow={handleDragRow}
    dropRow={handleDropRow}
  >
    <TextCell className="expand">
      <Box display="flex" alignItems="center">
        <Box mr="12px" display="flex">
          <T value={question.attributes.title_multiloc} />
        </Box>
        <WrongOptionsIndicator questionId={question.id} />
      </Box>
    </TextCell>

    <EditTitleButton
      className="e2e-edit-question"
      onClick={onEditOptions}
      buttonStyle="text"
      icon="edit"
    >
      <FormattedMessage {...messages.editPollAnswersButtonLabel} />
    </EditTitleButton>
    <ButtonWithLink
      className="e2e-delete-question"
      onClick={onDelete}
      buttonStyle="text"
      icon="delete"
    >
      <FormattedMessage {...messages.deleteQuestion} />
    </ButtonWithLink>
    <ButtonWithLink
      className="e2e-edit-options"
      onClick={onEdit}
      buttonStyle="secondary-outlined"
      icon="edit"
    >
      <FormattedMessage {...messages.editPollQuestion} />
    </ButtonWithLink>
  </SortableRow>
);

export default QuestionRow;
