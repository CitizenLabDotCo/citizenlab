import React from 'react';

import { useIntl } from 'utils/cl-intl';

import Icon from '../Icon';

import messages from './messages';
import styles from './TranslatedField.module.css';
import { TranslationLanguage } from './types';
import '../tokens.css';

type Props = {
  languages: TranslationLanguage[];
  hasText: boolean;
  isBlocked: boolean;
};

// Counts the languages done. Grey before any text, amber while languages are
// missing, teal once all are done, red after a save stopped on a missing one.
const LanguageCount = ({ languages, hasText, isBlocked }: Props) => {
  const { formatMessage } = useIntl();

  const total = languages.length;
  const done = hasText ? languages.filter((language) => language.done).length : 0;
  const status =
    isBlocked && done < total
      ? 'blocked'
      : !hasText
      ? 'empty'
      : done === total
      ? 'complete'
      : 'toTranslate';

  return (
    <span
      role="status"
      className={`${styles.count} ${styles[status]}`}
      data-status={status}
    >
      {status === 'complete' && (
        <Icon name="check-14" className={styles.countCheck} />
      )}
      {formatMessage(messages.languagesCount, { done, total })}
    </span>
  );
};

export default LanguageCount;
