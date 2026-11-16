import React from 'react';

import '../tokens.css';
import styles from './NewDot.module.css';

export type NewDotProps = {
  // Without a label the dot is decorative; the surrounding text must say what is new.
  'aria-label'?: string;
};

const NewDot = ({ 'aria-label': ariaLabel }: NewDotProps) => (
  <span
    className={styles.newDot}
    role={ariaLabel ? 'img' : undefined}
    aria-label={ariaLabel}
    aria-hidden={ariaLabel ? undefined : true}
  />
);

export default NewDot;
