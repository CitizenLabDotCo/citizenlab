import React from 'react';

import {
  Button,
  Group,
  Input,
  SearchField as AriaSearchField,
} from 'react-aria-components';

import Icon from '../Icon';
import '../tokens.css';
import inputStyles from '../TextField/input.module.css';

import styles from './SearchField.module.css';

export type SearchFieldProps = {
  // There is no visible label, so the field needs a name.
  'aria-label': string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  size?: 32 | 36;
  isDisabled?: boolean;
  autoFocus?: boolean;
  'data-cy'?: string;
};

const SearchField = ({
  'aria-label': ariaLabel,
  value,
  defaultValue,
  onChange,
  onSubmit,
  onClear,
  placeholder,
  size = 32,
  isDisabled = false,
  autoFocus,
  'data-cy': dataCy,
}: SearchFieldProps) => (
  <AriaSearchField
    className={styles.searchField}
    aria-label={ariaLabel}
    value={value}
    defaultValue={defaultValue}
    onChange={onChange}
    onSubmit={onSubmit}
    onClear={onClear}
    isDisabled={isDisabled}
    autoFocus={autoFocus}
    data-cy={dataCy}
  >
    <Group className={`${styles.group} ${inputStyles[`size${size}`]}`}>
      <Icon name="search-16" className={styles.searchIcon} />
      <Input className={styles.input} placeholder={placeholder} />
      {/* React Aria names the clear button and leaves it out of the tab order; Esc also clears. */}
      <Button className={styles.clear}>
        <Icon name="x-16" className={styles.clearIcon} />
      </Button>
    </Group>
  </AriaSearchField>
);

export default SearchField;
