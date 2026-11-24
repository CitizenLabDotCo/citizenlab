import React, { ReactNode } from 'react';

import Button, { ButtonVariant } from 'design-system/Button';
import Popover, { DialogTrigger } from 'design-system/Popover';

import styles from './HeaderDropdown.module.css';
import 'design-system/tokens.css';

export type HeaderDropdownName = 'publish' | 'share' | 'review';

interface Props {
  opened: boolean;
  onOpenChange: (opened: boolean) => void;
  label: ReactNode;
  // Names the panel, which has no title of its own.
  panelLabel: string;
  variant: ButtonVariant;
  hasMenu?: boolean;
  id: string;
  panelWidth: 'publish' | 'share';
  content: JSX.Element;
  disabled?: boolean;
  disabledReason?: ReactNode;
}

const HeaderDropdown = ({
  opened,
  onOpenChange,
  label,
  panelLabel,
  variant,
  hasMenu = true,
  id,
  panelWidth,
  content,
  disabled,
  disabledReason,
}: Props) => (
  <DialogTrigger
    isOpen={opened}
    // A button with a disabled reason stays pressable for its tooltip, so the
    // trigger would still open the panel without this guard.
    onOpenChange={(nextOpened) => {
      if (disabled && nextOpened) return;
      onOpenChange(nextOpened);
    }}
  >
    <Button
      id={id}
      variant={variant}
      size={32}
      hasMenu={hasMenu}
      isDisabled={disabled}
      disabledReason={disabled ? disabledReason : undefined}
    >
      {label}
    </Button>
    <Popover aria-label={panelLabel} width="hug">
      <div className={styles[panelWidth]}>{content}</div>
    </Popover>
  </DialogTrigger>
);

export default HeaderDropdown;
