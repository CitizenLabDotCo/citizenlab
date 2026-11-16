import React, { ReactNode, useId, useRef } from 'react';

import { Switch as AriaSwitch } from 'react-aria-components';

import ReasonTooltip from '../disabledReason/ReasonTooltip';
import useAriaDisabledInput from '../disabledReason/useAriaDisabledInput';
import { SwitchTrack } from '../Switch';
import '../tokens.css';

import styles from './SwitchRow.module.css';

export type PopoverSwitchRowProps = {
  children: ReactNode;
  isSelected?: boolean;
  defaultSelected?: boolean;
  onChange?: (isSelected: boolean) => void;
  isDisabled?: boolean;
  // Looks disabled but stays focusable so the tooltip can say why; it can't be toggled.
  disabledReason?: ReactNode;
  'data-cy'?: string;
};

// The same row as a Switch, for a Popover + Dialog that holds other controls too.
const PopoverSwitchRow = ({
  children,
  isSelected,
  defaultSelected,
  onChange,
  isDisabled,
  disabledReason,
  'data-cy': dataCy,
}: PopoverSwitchRowProps) => {
  const hasReason = !!disabledReason;
  const reasonId = useId();
  const rowRef = useRef<HTMLLabelElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  useAriaDisabledInput(inputRef, hasReason);

  return (
    <AriaSwitch
      ref={rowRef}
      inputRef={inputRef}
      className={`${styles.row} ${hasReason ? styles.withReason : ''}`}
      isSelected={isSelected}
      defaultSelected={defaultSelected}
      onChange={onChange}
      isDisabled={isDisabled && !hasReason}
      // Read-only keeps the row focusable and hoverable but ignores toggling.
      isReadOnly={hasReason}
      aria-describedby={hasReason ? reasonId : undefined}
      data-cy={dataCy}
    >
      {({ isSelected, isDisabled, isHovered, isFocusVisible }) => (
        <>
          <span className={styles.label}>{children}</span>
          <SwitchTrack
            size={28}
            isSelected={isSelected}
            isDisabled={isDisabled || hasReason}
          />
          {hasReason && (
            <>
              <span id={reasonId} hidden>
                {disabledReason}
              </span>
              <ReasonTooltip
                content={disabledReason}
                triggerRef={rowRef}
                isHovered={isHovered}
                isFocusVisible={isFocusVisible}
              />
            </>
          )}
        </>
      )}
    </AriaSwitch>
  );
};

export default PopoverSwitchRow;
