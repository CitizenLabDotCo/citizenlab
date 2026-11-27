import React, { useState } from 'react';

import AlertDialog from 'design-system/AlertDialog';
import IconButton from 'design-system/IconButton';

import { IIdeaData } from 'api/ideas/types';
import useDeleteIdea from 'api/ideas/useDeleteIdea';

import warningModalMessages from 'components/WarningModal/messages';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';
import useInputTermLabels from '../useInputTermLabels';

import styles from './SidePanel.module.css';

interface Props {
  idea: IIdeaData;
  onEdit: () => void;
  onDeleted: () => void;
}

const QuickActions = ({ idea, onEdit, onDeleted }: Props) => {
  const { formatMessage } = useIntl();
  const { inputTerm } = useInputTermLabels();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const { mutate: deleteIdea, isPending } = useDeleteIdea();

  const handleDelete = () =>
    deleteIdea(idea.id, {
      onSuccess: () => {
        setDeleteModalOpen(false);
        onDeleted();
      },
    });

  return (
    <div className={styles.quickActions}>
      <IconButton
        variant="bordered"
        icon="square-pen-16"
        aria-label={formatMessage(messages.edit)}
        onPress={onEdit}
      />
      <IconButton
        variant="bordered"
        icon="eye-16"
        aria-label={formatMessage(messages.viewOnSite)}
        // A button cannot carry a typed route link, and this one opens a new tab.
        onPress={() =>
          window.open(`/ideas/${idea.attributes.slug}`, '_blank', 'noopener')
        }
      />
      <IconButton
        variant="bordered"
        icon="trash-2-16"
        aria-label={formatMessage(messages.delete)}
        onPress={() => setDeleteModalOpen(true)}
      />
      <AlertDialog
        isOpen={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        isPending={isPending}
        title={formatMessage(messages.deleteTermTitle, { inputTerm })}
        confirmLabel={formatMessage(warningModalMessages.confirm)}
        onConfirm={handleDelete}
      >
        {formatMessage(messages.deleteTermExplanation, { inputTerm })}
      </AlertDialog>
    </div>
  );
};

export default QuickActions;
