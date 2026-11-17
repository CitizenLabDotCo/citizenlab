import React, { ReactNode, useId, useRef } from 'react';

import { Radio as AriaRadio } from 'react-aria-components';

import { useRegisterReasonKey } from '../disabledReason/reasonKeys';
import ReasonTooltip from '../disabledReason/ReasonTooltip';
import useAriaDisabledInput from '../disabledReason/useAriaDisabledInput';

import styles from './RadioGroup.module.css';
import '../tokens.css';

type RadioProps = {
  value: string;
  children: ReactNode;
  isDisabled?: boolean;
  // Looks disabled but stays focusable (arrow keys reach it) so the tooltip can say
  // why; it can't be chosen.
  disabledReason?: ReactNode;
};

// Only used inside a RadioGroup.
const Radio = ({ value, children, isDisabled, disabledReason }: RadioProps) => {
  const hasReason = !!disabledReason;
  const reasonId = useId();
  const rootRef = useRef<HTMLLabelElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  useRegisterReasonKey(value, hasReason);
  useAriaDisabledInput(inputRef, hasReason);

  return (
    <AriaRadio
      ref={rootRef}
      inputRef={inputRef}
      className={`${styles.radio} ${hasReason ? styles.withReason : ''}`}
      value={value}
      isDisabled={isDisabled && !hasReason}
      aria-describedby={hasReason ? reasonId : undefined}
    >
      {({ isFocusVisible, isHovered }) => (
        <>
          <span
            className={styles.indicator}
            data-focus-visible={isFocusVisible || undefined}
          >
            <span className={styles.dot} />
          </span>
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
    </AriaRadio>
  );
};

export default Radio;
