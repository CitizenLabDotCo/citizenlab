import React from 'react';

import Icon from 'design-system/Icon';

import styles from './MultilocFields.module.css';
import 'design-system/tokens.css';

interface Props {
  message?: string;
}

// The one line under a language group that names what is left to translate.
const MissingLanguages = ({ message }: Props) =>
  message ? (
    <p role="alert" className={styles.missingLanguages} data-save-error>
      <Icon name="info-16" className={styles.missingLanguagesIcon} />
      {message}
    </p>
  ) : null;

export default MissingLanguages;
