import React, { useState } from 'react';

import AlertDialog from 'design-system/AlertDialog';
import IconButton from 'design-system/IconButton';
import SelectionBar from 'design-system/SelectionBar';
import Text from 'design-system/Text';

import { IIdeaData } from 'api/ideas/types';

import warningModalMessages from 'components/WarningModal/messages';

import { useIntl } from 'utils/cl-intl';

import useBatchActions from '../InputManager/BatchBar/useBatchActions';
import { BatchFeedback } from '../InputManager/BatchBar/useBatchFeedback';
import managerMessages from '../InputManager/messages';

import messages from './messages';
import 'design-system/tokens.css';

interface Props {
  ideas: IIdeaData[];
  onClear: () => void;
  onFeedback: (feedback: BatchFeedback) => void;
  onDeleted: (ideaIds: string[]) => void;
  selectAllFailed: boolean;
}

const StatementBatchBar = ({
  ideas,
  onClear,
  onFeedback,
  onDeleted,
  selectAllFailed,
}: Props) => {
  const { formatMessage } = useIntl();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const { deleteAll, isDeleting } = useBatchActions({
    ideas,
    inputTerm: 'statement',
    onFeedback,
    onDeleted: (ideaIds) => {
      setDeleteModalOpen(false);
      onDeleted(ideaIds);
    },
  });

  const isSingle = ideas.length === 1;
  const statementCount = (count: number) =>
    formatMessage(messages.statementCount, { count });
  const term = formatMessage(messages.statementNoun);
  const terms = formatMessage(messages.statementsNoun);

  return (
    <>
      <SelectionBar count={ideas.length} onClearSelection={onClear}>
        {selectAllFailed && (
          <Text as="span" variant="small" tone="danger" role="alert">
            {formatMessage(managerMessages.selectAllFailed)}
          </Text>
        )}

        <IconButton
          variant="bordered"
          icon="trash-2-16"
          aria-label={
            isSingle
              ? formatMessage(managerMessages.delete)
              : formatMessage(managerMessages.deleteTerms, {
                  termCount: statementCount(ideas.length),
                })
          }
          onPress={() => setDeleteModalOpen(true)}
        />
      </SelectionBar>

      <AlertDialog
        isOpen={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        isPending={isDeleting}
        title={
          isSingle
            ? formatMessage(managerMessages.deleteTermTitle, { term })
            : formatMessage(managerMessages.deleteTermsTitle2, {
                termCount: statementCount(ideas.length),
              })
        }
        confirmLabel={formatMessage(warningModalMessages.confirm)}
        onConfirm={deleteAll}
      >
        {isSingle
          ? formatMessage(managerMessages.deleteTermExplanation, { term })
          : formatMessage(managerMessages.deleteTermsExplanation, { terms })}
      </AlertDialog>
    </>
  );
};

export default StatementBatchBar;
