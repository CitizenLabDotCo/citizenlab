import React, { useId, useState } from 'react';

import { Input, TextField as AriaTextField } from 'react-aria-components';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import IconButton from '../IconButton';
import inputStyles from '../TextField/input.module.css';
import '../tokens.css';

import messages from './messages';
import styles from './TagListAddField.module.css';

export type TagListAddFieldProps = {
  // A name already in the list is not added; the field turns Invalid instead.
  existingNames: string[];
  onAdd: (name: string) => void;
  defaultValue?: string;
  autoFocus?: boolean;
  'data-cy'?: string;
};

const isSameName = (a: string, b: string) =>
  a.trim().toLocaleLowerCase() === b.trim().toLocaleLowerCase();

const TagListAddField = ({
  existingNames,
  onAdd,
  defaultValue = '',
  autoFocus,
  'data-cy': dataCy,
}: TagListAddFieldProps) => {
  const { formatMessage } = useIntl();
  const messageId = useId();
  const [value, setValue] = useState(defaultValue);
  const [duplicate, setDuplicate] = useState<string | null>(null);

  const add = () => {
    const name = value.trim();
    if (!name) return;

    const existing = existingNames.find((n) => isSameName(n, name));
    if (existing !== undefined) {
      setDuplicate(existing);
      return;
    }

    onAdd(name);
    setValue('');
  };

  const handleChange = (next: string) => {
    setValue(next);
    setDuplicate(null);
  };

  return (
    <div className={styles.addField} data-cy={dataCy}>
      {duplicate !== null && (
        <p id={messageId} className={styles.message} role="alert">
          <FormattedMessage
            {...messages.alreadyInList}
            values={{ name: duplicate }}
          />
        </p>
      )}
      <div className={styles.row}>
        <AriaTextField
          aria-label={formatMessage(messages.addTag)}
          aria-describedby={duplicate !== null ? messageId : undefined}
          value={value}
          onChange={handleChange}
          isInvalid={duplicate !== null}
          autoFocus={autoFocus}
          onKeyDown={(e) => {
            if (e.key === 'Enter') add();
          }}
          className={styles.field}
        >
          <Input
            className={`${inputStyles.input} ${inputStyles.size36}`}
            placeholder={formatMessage(messages.addTagPlaceholder)}
          />
        </AriaTextField>
        <IconButton
          variant="bordered"
          size={28}
          icon="plus-16"
          aria-label={formatMessage(messages.addTag)}
          onPress={add}
        />
      </div>
    </div>
  );
};

export default TagListAddField;
