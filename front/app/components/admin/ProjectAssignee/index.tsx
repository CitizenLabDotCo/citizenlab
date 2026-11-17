import React from 'react';

import { UNASSIGNED } from 'components/admin/PostManager/useAssigneeOptions';

import ComboBox from 'design-system/ComboBox';
import { ListBoxOption } from 'design-system/ListBox';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import useProjectAssignee from './useProjectAssignee';
import 'design-system/tokens.css';

interface Props {
  projectId: string;
  defaultOpen?: boolean;
  onClose?: () => void;
  assignee?: string | null;
  onAssigneeChange: (assignee: string | null) => void;
}

const ProjectAssignee = ({
  projectId,
  assignee,
  onAssigneeChange,
  defaultOpen,
  onClose,
}: Props) => {
  const { formatMessage } = useIntl();
  const { loaded, options, savedAssignee } = useProjectAssignee(projectId);

  if (!loaded) return null;

  return (
    <ComboBox
      defaultOpen={defaultOpen}
      autoFocus={defaultOpen}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose?.();
      }}
      label={formatMessage(messages.assignee)}
      description={formatMessage(messages.assigneeDescription)}
      size={32}
      defaultItems={options.map(({ value, label }) => ({ id: value, label }))}
      value={(assignee === undefined ? savedAssignee : assignee) ?? UNASSIGNED}
      onChange={(value) =>
        onAssigneeChange(
          typeof value === 'string' && value !== UNASSIGNED ? value : null
        )
      }
    >
      {(option: { id: string; label: string }) => (
        <ListBoxOption id={option.id} icon="user-16">
          {option.label}
        </ListBoxOption>
      )}
    </ComboBox>
  );
};

export default ProjectAssignee;
