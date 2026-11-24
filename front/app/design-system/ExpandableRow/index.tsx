import React, { ReactNode } from 'react';

import {
  Button as AriaButton,
  Disclosure,
  DisclosurePanel,
  Heading,
} from 'react-aria-components';

import Icon from '../Icon';

import styles from './ExpandableRow.module.css';
import '../tokens.css';

type Props = {
  title: ReactNode;
  // Plain grey text at the end of the row, for example "34 inputs · 0 topics".
  summary?: ReactNode;
  children: ReactNode;
  defaultExpanded?: boolean;
  headingLevel?: 3 | 4;
};

// A flat row inside a card that opens its detail below. Rows stack with a hairline between them.
const ExpandableRow = ({
  title,
  summary,
  children,
  defaultExpanded = false,
  headingLevel = 4,
}: Props) => (
  <Disclosure className={styles.row} defaultExpanded={defaultExpanded}>
    <Heading className={styles.heading} level={headingLevel}>
      <AriaButton slot="trigger" className={styles.trigger}>
        <span className={styles.title}>{title}</span>
        {summary && <span className={styles.summary}>{summary}</span>}
        <Icon name="chevron-right-16" className={styles.chevron} />
      </AriaButton>
    </Heading>
    <DisclosurePanel className={styles.panel}>{children}</DisclosurePanel>
  </Disclosure>
);

export default ExpandableRow;
