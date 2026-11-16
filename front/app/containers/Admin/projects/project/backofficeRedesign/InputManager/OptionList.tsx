import React, { ReactNode } from 'react';

import Menu, { MenuItem } from 'design-system/Menu';

import ColorDot from './ColorDot';
import styles from './OptionList.module.css';

export interface Option {
  value: string;
  label: string;
  color?: string;
  count?: number;
  disabled?: boolean;
  disabledReason?: ReactNode;
}

interface Props {
  'aria-label': string;
  options: Option[];
  selected: string[];
  onToggle: (value: string) => void;
  selectionMode?: 'single' | 'multiple';
}

// The menu of a MenuTrigger, SubmenuTrigger or FilterChip.
const OptionList = ({
  'aria-label': ariaLabel,
  options,
  selected,
  onToggle,
  selectionMode = 'multiple',
}: Props) => (
  <Menu
    aria-label={ariaLabel}
    selectionMode={selectionMode}
    selectedKeys={new Set(selected)}
    disabledKeys={options
      .filter((option) => option.disabled && !option.disabledReason)
      .map((option) => option.value)}
    onAction={(key) => onToggle(String(key))}
  >
    {options.map((option) => (
      <MenuItem
        key={option.value}
        id={option.value}
        textValue={option.label}
        count={option.count}
        disabledReason={option.disabled ? option.disabledReason : undefined}
      >
        <span className={styles.label}>
          {option.color && <ColorDot color={option.color} />}
          {option.label}
        </span>
      </MenuItem>
    ))}
  </Menu>
);

export default OptionList;
