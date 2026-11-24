import React, { useId } from 'react';

import Button from 'design-system/Button';
import Menu, { MenuItem, MenuTrigger } from 'design-system/Menu';
import TooltipMark from 'design-system/Tooltip/TooltipMark';

import useProjectBackofficeRedesign from 'hooks/useProjectBackofficeRedesign';

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
  const redesign = useProjectBackofficeRedesign();
  const { loaded, options, savedAssignee } = useProjectAssignee(projectId);
  const labelId = useId();
  const descriptionId = useId();

  if (!loaded) return null;

  const title = formatMessage(messages.assignee);
  const description = formatMessage(messages.assigneeDescription);
  const selected =
    (assignee === undefined ? savedAssignee : assignee) ?? UNASSIGNED;
  const selectedLabel = options.find(({ value }) => value === selected)?.label;

  return (
    <div className={styles.row}>
      <div className={redesign ? styles.tooltipLabel : styles.text}>
        <span id={labelId} className={styles.label}>
          {title}
        </span>
        {redesign ? (
          <TooltipMark label={title} content={description} />
        ) : (
          <span id={descriptionId} className={styles.description}>
            {description}
          </span>
        )}
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
          aria-describedby={redesign ? labelId : `${labelId} ${descriptionId}`}
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
