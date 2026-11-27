import React, { useId } from 'react';

import Button from 'design-system/Button';
import Menu, { MenuItem, MenuTrigger } from 'design-system/Menu';
import PillButton from 'design-system/PillButton';
import Tooltip, { TooltipTarget } from 'design-system/Tooltip';

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

  const menu = (
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
  );
  const onOpenChange = (isOpen: boolean) => {
    if (!isOpen) onClose?.();
  };

  if (redesign) {
    return (
      <div className={styles.panelRow}>
        <div className={styles.text}>
          {/* The label itself explains the setting; there is no separate info mark. */}
          <Tooltip content={formatMessage(messages.assigneeTooltip)}>
            <TooltipTarget className={styles.tooltipLabel}>
              <span id={labelId}>{title}</span>
            </TooltipTarget>
          </Tooltip>
          <span id={descriptionId} className={styles.description}>
            {description}
          </span>
        </div>
        <MenuTrigger defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
          <PillButton aria-describedby={`${labelId} ${descriptionId}`}>
            {selectedLabel}
          </PillButton>
          {menu}
        </MenuTrigger>
      </div>
    );
  }

  return (
    <div className={styles.row}>
      <div className={styles.text}>
        <span id={labelId} className={styles.label}>
          {title}
        </span>
        <span id={descriptionId} className={styles.description}>
          {description}
        </span>
      </div>
      <MenuTrigger defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
        <Button
          variant="secondary"
          size={28}
          icon="user-16"
          hasMenu
          aria-describedby={`${labelId} ${descriptionId}`}
        >
          {selectedLabel}
        </Button>
        {menu}
      </MenuTrigger>
    </div>
  );
};

export default ProjectAssignee;
