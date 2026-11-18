import React, { useId } from 'react';

import Button from 'design-system/Button';
import Menu, { MenuItem, MenuTrigger } from 'design-system/Menu';

import { UNASSIGNED } from 'components/admin/PostManager/useAssigneeOptions';
import 'design-system/tokens.css';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import styles from './ProjectAssignee.module.css';
import useProjectAssignee from './useProjectAssignee';

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
  const labelId = useId();
  const descriptionId = useId();

  if (!loaded) return null;

  const title = formatMessage(messages.assignee);
  const selected =
    (assignee === undefined ? savedAssignee : assignee) ?? UNASSIGNED;
  const selectedLabel = options.find(({ value }) => value === selected)?.label;

  return (
    <div className={styles.row}>
      <div className={styles.text}>
        <span id={labelId} className={styles.label}>
          {title}
        </span>
        <span id={descriptionId} className={styles.description}>
          {formatMessage(messages.assigneeDescription)}
        </span>
      </div>
      <MenuTrigger
        defaultOpen={defaultOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) onClose?.();
        }}
      >
        <Button
          variant="secondary"
          size={28}
          icon="user-16"
          hasMenu
          aria-describedby={`${labelId} ${descriptionId}`}
        >
          {selectedLabel}
        </Button>
        <Menu
          aria-label={title}
          placement="bottom end"
          selectionMode="single"
          selectedKeys={new Set([selected])}
          onAction={(key) =>
            onAssigneeChange(
              typeof key === 'string' && key !== UNASSIGNED ? key : null
            )
          }
        >
          {options.map(({ value, label }) => (
            <MenuItem key={value} id={value} icon="user-16">
              {label}
            </MenuItem>
          ))}
        </Menu>
      </MenuTrigger>
    </div>
  );
};

export default ProjectAssignee;
