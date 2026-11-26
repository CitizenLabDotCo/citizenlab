import React, { useId } from 'react';

import styles from './NewProjectForm.module.css';
import 'design-system/tokens.css';

interface Props {
  label: string;
  children: React.ReactNode;
}

const FormSection = ({ label, children }: Props) => {
  const labelId = useId();

  return (
    <div role="group" aria-labelledby={labelId} className={styles.section}>
      <p id={labelId} className={styles.sectionLabel}>
        {label}
      </p>
      {children}
    </div>
  );
};

export default FormSection;
