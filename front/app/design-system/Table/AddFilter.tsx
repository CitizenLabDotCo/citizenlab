import React, { ReactNode } from 'react';

import { Button as AriaButton, PressEvent } from 'react-aria-components';

import { FormattedMessage } from 'utils/cl-intl';

import Icon from '../Icon';
import '../tokens.css';

import styles from './AddFilter.module.css';
import messages from './messages';

export type AddFilterProps = {
  // Defaults to Filter.
  children?: ReactNode;
  onPress?: (e: PressEvent) => void;
  'data-cy'?: string;
};

// + Filter: the trigger of the facet menu (MenuTrigger). Tighter than a Quiet 28 Button, as drawn.
const AddFilter = ({
  children,
  onPress,
  'data-cy': dataCy,
}: AddFilterProps) => (
  <AriaButton className={styles.addFilter} onPress={onPress} data-cy={dataCy}>
    <Icon name="plus-14" className={styles.icon} />
    <span className={styles.label}>
      {children ?? <FormattedMessage {...messages.addFilter} />}
    </span>
  </AriaButton>
);

export default AddFilter;
