import React from 'react';

import { ProgressBar } from 'react-aria-components';

import '../tokens.css';
import styles from './Spinner.module.css';

type Props = {
  // Accent on light surfaces, Inverse inside a filled Primary or Danger button.
  tone?: 'accent' | 'inverse';
  'aria-label'?: string;
};

export const SpinnerGraphic = ({ tone = 'accent' }: Pick<Props, 'tone'>) => (
  <span className={`${styles.spinner} ${styles[tone]}`} aria-hidden />
);

const Spinner = ({ tone = 'accent', 'aria-label': ariaLabel }: Props) => (
  <ProgressBar isIndeterminate aria-label={ariaLabel}>
    <SpinnerGraphic tone={tone} />
  </ProgressBar>
);

export default Spinner;
