import React, { ReactNode } from 'react';

import { Radio } from 'design-system/RadioGroup';

import styles from './ChoiceRadio.module.css';
import 'design-system/tokens.css';

interface Props {
  value: string;
  title: string;
  /** Shown next to the title, like a summary pill. */
  titleAdornment?: ReactNode;
  description: string;
  disabled?: boolean;
  /** Disables the option; it stays focusable and its tooltip says why. */
  disabledReason?: string;
}

// One option of a design-system RadioGroup, which owns the value.
const ChoiceRadio = ({
  value,
  title,
  titleAdornment,
  description,
  disabled,
  disabledReason,
}: Props) => (
  <Radio value={value} isDisabled={disabled} disabledReason={disabledReason}>
    <span className={styles.text}>
      <span className={styles.titleRow}>
        <span className={styles.title}>{title}</span>
        {titleAdornment}
      </span>
      <span className={styles.description}>{description}</span>
    </span>
  </Radio>
);

export default ChoiceRadio;
