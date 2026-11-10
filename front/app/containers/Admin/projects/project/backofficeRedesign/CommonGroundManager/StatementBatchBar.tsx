import React, { useState } from 'react';

import {
  Box,
  Button,
  colors,
  IconButton,
  Text,
} from '@citizenlab/cl2-component-library';

import { IIdeaData } from 'api/ideas/types';

import WarningModal from 'components/WarningModal';

import { useIntl } from 'utils/cl-intl';

import SelectAllButton from '../InputManager/BatchBar/SelectAllButton';
import useBatchActions from '../InputManager/BatchBar/useBatchActions';
import managerMessages from '../InputManager/messages';

import messages from './messages';

interface Props {
  ideas: IIdeaData[];
  total: number | undefined;
  onEdit: (ideaId: string) => void;
  onClear: () => void;
  onDeleted: () => void;
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
  const { deleteAll, isDeleting } = useBatchActions({
    ideas,
    onUpdated: () => undefined,
    onDeleted: () => {
      setDeleteModalOpen(false);
      onDeleted();
    },
  });

  const isSingle = ideas.length === 1;
  const statementCount = (count: number) =>
    formatMessage(messages.statementCount, { count });
  const term = formatMessage(messages.statementNoun);
  const terms = formatMessage(messages.statementsNoun);

  return (
    <Box display="flex" alignItems="center" gap="8px" flexWrap="wrap">
      <Text variant="boSection" m="0" mr="4px">
        {formatMessage(managerMessages.selectedCount, { count: ideas.length })}
      </Text>

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
          buttonStyle="bo-secondary"
          icon="edit"
          onClick={() => onEdit(ideas[0].id)}
        >
          {formatMessage(managerMessages.edit)}
        </Button>
      )}

      <Button
        buttonStyle="bo-delete"
        icon="delete"
        onClick={() => setDeleteModalOpen(true)}
      >
        {isSingle
          ? formatMessage(managerMessages.delete)
          : formatMessage(managerMessages.deleteTerms, {
              termCount: statementCount(ideas.length),
            })}
      </Button>

      <IconButton
        iconName="close"
        iconWidth="18px"
        iconHeight="18px"
        iconColor={colors.coolGrey600}
        iconColorOnHover={colors.textPrimary}
        a11y_buttonActionMessage={formatMessage(managerMessages.clearSelection)}
        onClick={onClear}
      />

      <WarningModal
        open={deleteModalOpen}
        isLoading={isDeleting}
        title={
          isSingle
            ? formatMessage(managerMessages.deleteTermTitle, { term })
            : formatMessage(managerMessages.deleteTermsTitle, { terms })
        }
        explanation={
          isSingle
            ? formatMessage(managerMessages.deleteTermExplanation, { term })
            : formatMessage(managerMessages.deleteTermsExplanation, { terms })
        }
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={deleteAll}
      />
    </Box>
  );
};

export default StatementBatchBar;
