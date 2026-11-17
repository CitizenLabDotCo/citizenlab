import React from 'react';

import { ProgressBar } from 'react-aria-components';

import '../tokens.css';
import styles from './Spinner.module.css';

type GraphicProps = {
  // Accent on light surfaces, Inverse inside a filled Primary or Danger button.
  tone?: 'accent' | 'inverse';
};

type Props = {
  'aria-label'?: string;
};

export const SpinnerGraphic = ({ tone = 'accent' }: GraphicProps) => (
  <span className={`${styles.spinner} ${styles[tone]}`} aria-hidden />
);

const Spinner = ({ 'aria-label': ariaLabel }: Props) => (
  <ProgressBar isIndeterminate aria-label={ariaLabel}>
    <SpinnerGraphic />
  </ProgressBar>
);

export default Spinner;
