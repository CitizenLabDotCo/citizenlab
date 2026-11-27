import React from 'react';

import Icon from '../Icon';

import styles from './TranslatedField.module.css';
import '../tokens.css';

// The one line under translated fields that names what is left to translate.
const TranslationGap = ({ message }: { message: string }) => (
  <p role="alert" className={styles.gap} data-translation-gap>
    <Icon name="triangle-alert-16" className={styles.gapIcon} />
    {message}
  </p>
);

export default TranslationGap;
