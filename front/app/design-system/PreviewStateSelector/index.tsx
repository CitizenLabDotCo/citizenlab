import React from 'react';

import {
  Key,
  ToggleButton as AriaToggleButton,
  ToggleButtonGroup as AriaToggleButtonGroup,
} from 'react-aria-components';

import Tooltip from '../Tooltip';

import styles from './PreviewStateSelector.module.css';
import '../tokens.css';

type Option = {
  id: string;
  label: string;
  // Explains what the preview shows in this state.
  tooltip?: string;
};

type Props = {
  'aria-label': string;
  options: Option[];
  selectedKey: string;
  onSelectionChange: (key: string) => void;
};

const PreviewStateSelector = ({
  'aria-label': ariaLabel,
  options,
  selectedKey,
  onSelectionChange,
}: Props) => (
  <AriaToggleButtonGroup
    className={styles.track}
    aria-label={ariaLabel}
    selectionMode="single"
    disallowEmptySelection
    selectedKeys={[selectedKey]}
    // Single selection that can't be emptied, so the set holds the one picked key.
    onSelectionChange={(keys: Set<Key>) =>
      keys.forEach((key) => onSelectionChange(String(key)))
    }
  >
    {options.map(({ id, label, tooltip }) => {
      const item = (
        <AriaToggleButton key={id} id={id} className={styles.item}>
          {label}
        </AriaToggleButton>
      );

      return tooltip ? (
        <Tooltip key={id} content={tooltip}>
          {item}
        </Tooltip>
      ) : (
        item
      );
    })}
  </AriaToggleButtonGroup>
);

export default PreviewStateSelector;
