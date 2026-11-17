import React from 'react';

import Switch from 'design-system/Switch';

import styles from './SettingToggleRow.module.css';
import 'design-system/tokens.css';

interface Props {
  id?: string;
  title: string;
  description?: string;
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
}

const SettingToggleRow = ({
  id,
  title,
  description,
  checked,
  disabled,
  onChange,
}: Props) => (
  <div>
    <Switch
      id={id}
      size={26}
      isSelected={checked}
      isDisabled={disabled}
      onChange={() => onChange()}
    >
      <span className={styles.text}>
        <span className={styles.title}>{title}</span>
        {description && (
          <span className={styles.description}>{description}</span>
        )}
      </span>
    </Switch>
  </div>
);

export default SettingToggleRow;
