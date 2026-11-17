import React, { ReactNode } from 'react';

import { Switch as AriaSwitch } from 'react-aria-components';

import '../tokens.css';

import styles from './Switch.module.css';
import SwitchTrack from './SwitchTrack';

type LabelProps =
  | { children: ReactNode; 'aria-label'?: string }
  // Show label off: the switch needs an aria-label.
  | { children?: undefined; 'aria-label': string };

type SwitchProps = LabelProps & {
  // 36 for forms and panels, 26 for the side panel.
  size: 36 | 26;
  isSelected?: boolean;
  onChange?: (isSelected: boolean) => void;
  isDisabled?: boolean;
  id?: string;
};

const Switch = ({
  children,
  size,
  isSelected,
  onChange,
  isDisabled,
  id,
  'aria-label': ariaLabel,
}: SwitchProps) => (
  <AriaSwitch
    className={styles.switch}
    isSelected={isSelected}
    onChange={onChange}
    isDisabled={isDisabled}
    id={id}
    aria-label={ariaLabel}
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
