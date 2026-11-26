import React, { ReactNode } from 'react';

import { Heading } from 'react-aria-components';

import Icon from '../Icon';
import UnstyledButton from '../UnstyledButton';

import styles from './PanelGroupHeader.module.css';
import '../tokens.css';

type Props = {
  label: ReactNode;
  // Panel: names a run of setting cards. Rail: a group of the project rail.
  context?: 'panel' | 'rail';
  level?: number;
  action?: ReactNode;
  toggle?: {
    id?: string;
    controls: string;
    expanded: boolean;
    onPress: () => void;
  };
};

const PanelGroupHeader = ({
  label,
  context = 'panel',
  action,
  toggle,
  level = 3,
}: Props) => (
  <div className={`${styles.header} ${styles[context]}`}>
    <Heading level={level} className={styles.label}>
      {toggle ? (
        <UnstyledButton
          className={styles.toggle}
          id={toggle.id}
          aria-expanded={toggle.expanded}
          aria-controls={toggle.controls}
          onPress={toggle.onPress}
        >
          {label}
          <Icon name="chevron-down-16" className={styles.chevron} />
        </UnstyledButton>
      ) : (
        label
      )}
    </Heading>
    {!toggle && action}
  </div>
);

export default PanelGroupHeader;
