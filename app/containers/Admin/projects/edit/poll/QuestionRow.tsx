// Libraries
import React from 'react';

// Services & Resources
import { isNilOrError } from 'utils/helperUtils';
import { IPollQuestion } from 'services/pollQuestions';
import GetPollOptions, { GetPollOptionsChildProps } from 'resources/GetPollOptions';

// Components
import Button from 'components/UI/Button';
import { SortableRow, TextCell } from 'components/admin/ResourceList';
import InfoTooltip from 'components/admin/InfoTooltip';
import T from 'components/T';

import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// Inline block so the button acts as a character and is stuck to the end of the title to make it clear it will edit the title text
const EditTitleButton = styled(Button)`
  display: inline-block
`;

const NoOptionsIndicator = styled(TextCell)`
  color: ${colors.clRed};
`;

const StyledInfoTooltip = styled(InfoTooltip)`
  display: inline-block;
  margin-right: 5px;
`;

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
        <EditTitleButton
          className="e2e-edit-question"
          onClick={onEdit}
          style="text"
          icon="edit"
          ariaLabel="edit"
        />
      </TextCell>

      <GetPollOptions questionId={question.id} >
        {(options: GetPollOptionsChildProps) => !isNilOrError(options) && options.length === 0 ? (
          <NoOptionsIndicator>
            <StyledInfoTooltip {...messages.noOptionsTooltip} position="bottom-left" iconColor={colors.clRed} />
            <FormattedMessage {...messages.noOptions} />
          </NoOptionsIndicator>
        ) : null}
      </GetPollOptions>

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
