import React, { ReactNode } from 'react';

import { Button as AriaButton } from 'react-aria-components';

import Icon from '../Icon';
import { SpinnerGraphic } from '../Spinner';

import styles from './PillButton.module.css';
import '../tokens.css';

type Props = {
  // The current value.
  children: ReactNode;
  // While a change saves, the spinner takes the chevron's place.
  isPending?: boolean;
  'aria-label'?: string;
};

// The library's Pill picker trigger: a grey pill with the value and a chevron,
// never a Button or a Select. Put it in a MenuTrigger with its Menu.
const PillButton = ({
  children,
  isPending = false,
  'aria-label': ariaLabel,
}: Props) => (
  <AriaButton
    className={styles.pill}
    isPending={isPending}
    aria-label={ariaLabel}
  >
    <span className={styles.label}>{children}</span>
    {isPending ? (
      <SpinnerGraphic tone="accent" />
    ) : (
      <Icon name="chevron-down-12" className={styles.chevron} />
    )}
  </AriaButton>
);

export default PillButton;
