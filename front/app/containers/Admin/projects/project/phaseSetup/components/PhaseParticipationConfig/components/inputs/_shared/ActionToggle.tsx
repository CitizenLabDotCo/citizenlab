import React from 'react';

import { Toggle } from '@citizenlab/cl2-component-library';

import Switch from 'design-system/Switch';
import 'design-system/tokens.css';

import styles from './ActionToggle.module.css';

interface Props {
  // The workspace panel renders the design-system switch; the page keeps its toggle.
  layout: 'page' | 'panel';
  checked: boolean;
  onChange: () => void;
  label: string;
}

const ActionToggle = ({ layout, checked, onChange, label }: Props) => {
  if (layout === 'panel') {
    return (
      <Switch size={26} isSelected={checked} onChange={() => onChange()}>
        <span className={styles.label}>{label}</span>
      </Switch>
    );
  }

  return <Toggle checked={checked} onChange={onChange} label={label} />;
};

export default ActionToggle;
