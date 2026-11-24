import React, { ReactNode, useContext } from 'react';

import {
  FieldError as AriaFieldError,
  FieldErrorContext,
} from 'react-aria-components';

import styles from './Field.module.css';

interface Props {
  children?: ReactNode;
  id?: string;
}

const FieldError = ({ children, id }: Props) => {
  const validation = useContext(FieldErrorContext);

  if (validation) {
    return (
      <AriaFieldError id={id} className={styles.error}>
        {children}
      </AriaFieldError>
    );
  }

  if (!children) return null;

  return (
    <p id={id} slot="errorMessage" className={styles.error}>
      {children}
    </p>
  );
};

export default FieldError;
