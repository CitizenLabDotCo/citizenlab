import React from 'react';

import { Toggle } from '@citizenlab/cl2-component-library';

import Switch from 'design-system/Switch';

import styles from './ActionToggle.module.css';
import 'design-system/tokens.css';

interface Props {
  // The workspace panel renders the design-system switch; the page keeps its toggle.
  layout: 'page' | 'panel';
  checked: boolean;
  onChange: () => void;
  label: string;
  'aria-describedby'?: string;
}

const ActionToggle = ({
  layout,
  checked,
  onChange,
  label,
  'aria-describedby': ariaDescribedBy,
}: Props) => {
  if (layout === 'panel') {
    return (
      <Switch
        aria-describedby={ariaDescribedBy}
        size={26}
        isSelected={checked}
        onChange={() => onChange()}
      >
        <span className={styles.label} data-off={!checked || undefined}>
          {label}
        </span>
      </Switch>
    );
  }

  return <Toggle checked={checked} onChange={onChange} label={label} />;
};

export default ActionToggle;
