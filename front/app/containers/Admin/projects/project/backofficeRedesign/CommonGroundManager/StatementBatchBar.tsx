import React, { useState } from 'react';

import AlertDialog from 'design-system/AlertDialog';
import Button from 'design-system/Button';
import SelectionBar from 'design-system/SelectionBar';

import { IIdeaData } from 'api/ideas/types';

import warningModalMessages from 'components/WarningModal/messages';

import { useIntl } from 'utils/cl-intl';

import BatchFailureAlert from '../InputManager/BatchBar/BatchFailureAlert';
import SelectAllButton from '../InputManager/BatchBar/SelectAllButton';
import useBatchActions from '../InputManager/BatchBar/useBatchActions';
import managerMessages from '../InputManager/messages';

import messages from './messages';
import 'design-system/tokens.css';

interface Props {
  ideas: IIdeaData[];
  total: number | undefined;
  onEdit: (ideaId: string) => void;
  onClear: () => void;
  onDeleted: (ideaIds: string[]) => void;
  onSelectAll: () => void;
  isSelectingAll: boolean;
  selectAllFailed: boolean;
}

const StatementBatchBar = ({
  ideas,
  total,
  onEdit,
  onClear,
  onDeleted,
  onSelectAll,
  isSelectingAll,
  selectAllFailed,
}: Props) => {
  const { formatMessage } = useIntl();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const { deleteAll, isDeleting, failure } = useBatchActions({
    ideas,
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
        {total !== undefined && ideas.length < total && (
          <SelectAllButton
            label={formatMessage(managerMessages.selectAllTerms, {
              termCount: statementCount(total),
            })}
            processing={isSelectingAll}
            failed={selectAllFailed}
            onClick={onSelectAll}
          />
        )}

        {isSingle && (
          <Button
            size={28}
            icon="square-pen-16"
            onPress={() => onEdit(ideas[0].id)}
          >
            {formatMessage(managerMessages.edit)}
          </Button>
        )}

        <Button
          variant="danger"
          size={28}
          icon="trash-2-16"
          onPress={() => setDeleteModalOpen(true)}
        >
          {isSingle
            ? formatMessage(managerMessages.delete)
            : formatMessage(managerMessages.deleteTerms, {
                termCount: statementCount(ideas.length),
              })}
        </Button>

        <BatchFailureAlert failure={failure} />
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
