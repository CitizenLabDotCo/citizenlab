import React, { ReactNode, useContext } from 'react';

import {
  Key,
  ToggleButton as AriaToggleButton,
  ToggleGroupStateContext,
} from 'react-aria-components';

import Icon, { IconName } from '../Icon';
import '../tokens.css';
import Tooltip from '../Tooltip';

import styles from './ToggleButton.module.css';

export type ToggleButtonProps = {
  children: ReactNode;
  // The item's key inside a ToggleButtonGroup.
  id?: Key;
  // A 14 px icon before the label.
  icon?: IconName;
  isSelected?: boolean;
  defaultSelected?: boolean;
  onChange?: (isSelected: boolean) => void;
  isDisabled?: boolean;
  // Looks disabled but stays focusable so the tooltip can say why.
  disabledReason?: ReactNode;
  'data-cy'?: string;
};

const ToggleButton = ({
  children,
  id,
  icon,
  isSelected,
  defaultSelected,
  onChange,
  isDisabled = false,
  disabledReason,
  'data-cy': dataCy,
}: ToggleButtonProps) => {
  const groupState = useContext(ToggleGroupStateContext);
  const hasReason = !!disabledReason;

  // Without its id the button leaves the group's selection, so pressing it can't
  // select it; it still draws whether the group has it selected.
  const reasonSelected =
    groupState && id !== undefined
      ? groupState.selectedKeys.has(id)
      : isSelected ?? defaultSelected ?? false;

  const button = (
    <AriaToggleButton
      className={styles.toggleButton}
      id={hasReason ? undefined : id}
      isSelected={hasReason ? reasonSelected : isSelected}
      defaultSelected={hasReason ? undefined : defaultSelected}
      onChange={hasReason ? undefined : onChange}
      isDisabled={isDisabled && !hasReason}
      aria-disabled={hasReason ? true : undefined}
      data-cy={dataCy}
    >
      {icon && <Icon name={icon} className={styles.icon} />}
      {children}
    </AriaToggleButton>
  );

  if (!hasReason) return button;

  return <Tooltip content={disabledReason}>{button}</Tooltip>;
};

export default ToggleButton;
