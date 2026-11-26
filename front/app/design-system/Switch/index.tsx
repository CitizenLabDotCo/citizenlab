import React, { ReactNode } from 'react';

import { Switch as AriaSwitch } from 'react-aria-components';

import styles from './Switch.module.css';
import SwitchTrack from './SwitchTrack';
import '../tokens.css';

type LabelProps =
  | { children: ReactNode; 'aria-label'?: string }
  // Show label off: the switch needs an aria-label.
  | { children?: undefined; 'aria-label': string };

type SwitchProps = LabelProps & {
  // 36 for forms and panels, 28 in a banner, 26 for the side panel.
  size: 36 | 28 | 26;
  isSelected?: boolean;
  onChange?: (isSelected: boolean) => void;
  isDisabled?: boolean;
  id?: string;
  labelAlign?: 'center' | 'top';
  'aria-describedby'?: string;
};

const Switch = ({
  children,
  size,
  isSelected,
  onChange,
  isDisabled,
  id,
  labelAlign = 'center',
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
}: SwitchProps) => (
  <AriaSwitch
    className={`${styles.switch} ${labelAlign === 'top' ? styles.top : ''}`}
    isSelected={isSelected}
    onChange={onChange}
    isDisabled={isDisabled}
    id={id}
    aria-label={ariaLabel}
    aria-describedby={ariaDescribedBy}
  >
    {({ isSelected, isFocusVisible }) => (
      <>
        <SwitchTrack
          size={size}
          isSelected={isSelected}
          isFocusVisible={isFocusVisible}
        />
        {children}
      </>
    )}
  </AriaSwitch>
);

export { SwitchTrack };

export default Switch;
