import React, { ReactNode, useId, useRef } from 'react';

import { Switch as AriaSwitch } from 'react-aria-components';

import ReasonTooltip from '../disabledReason/ReasonTooltip';
import useAriaDisabledInput from '../disabledReason/useAriaDisabledInput';
import '../tokens.css';

import styles from './Switch.module.css';
import SwitchTrack, { SwitchSize } from './SwitchTrack';

type LabelProps =
  | { children: ReactNode; 'aria-label'?: string }
  // Show label off: the switch needs an aria-label.
  | { children?: undefined; 'aria-label': string };

export type SwitchProps = LabelProps & {
  // 36 for forms and panels, 28 inside a menu row, 26 for the side panel.
  size?: SwitchSize;
  isSelected?: boolean;
  defaultSelected?: boolean;
  onChange?: (isSelected: boolean) => void;
  isDisabled?: boolean;
  // Looks disabled but stays focusable so the tooltip can say why; it can't be toggled.
  disabledReason?: ReactNode;
  isReadOnly?: boolean;
  value?: string;
  name?: string;
  autoFocus?: boolean;
  id?: string;
  'data-cy'?: string;
};

const Switch = ({
  children,
  size = 36,
  isSelected,
  defaultSelected,
  onChange,
  isDisabled,
  disabledReason,
  isReadOnly,
  value,
  name,
  autoFocus,
  id,
  'aria-label': ariaLabel,
  'data-cy': dataCy,
}: SwitchProps) => {
  const hasReason = !!disabledReason;
  const reasonId = useId();
  const rootRef = useRef<HTMLLabelElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  useAriaDisabledInput(inputRef, hasReason);

  return (
    <AriaSwitch
      ref={rootRef}
      inputRef={inputRef}
      className={`${styles.switch} ${hasReason ? styles.withReason : ''}`}
      isSelected={isSelected}
      defaultSelected={defaultSelected}
      onChange={onChange}
      isDisabled={isDisabled && !hasReason}
      // Read-only keeps the switch focusable and hoverable but ignores toggling.
      isReadOnly={isReadOnly || hasReason}
      value={value}
      name={name}
      autoFocus={autoFocus}
      id={id}
      aria-label={ariaLabel}
      aria-describedby={hasReason ? reasonId : undefined}
      data-cy={dataCy}
    >
      {({ isSelected, isFocusVisible, isHovered }) => (
        <>
          <SwitchTrack
            size={size}
            isSelected={isSelected}
            isFocusVisible={isFocusVisible}
          />
          {children}
          {hasReason && (
            <>
              <span id={reasonId} hidden>
                {disabledReason}
              </span>
              <ReasonTooltip
                content={disabledReason}
                triggerRef={rootRef}
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

export type { SwitchSize };
export { SwitchTrack };

export default Switch;
