import React, { ReactNode } from 'react';

// The preview copies the citizen event page and keeps its icons.
import { Icon, IconNames } from '@citizenlab/cl2-component-library';
import 'design-system/tokens.css';

import styles from './PreviewInfoRow.module.css';

interface Props {
  icon: IconNames;
  empty?: boolean;
  children: ReactNode;
}

const PreviewInfoRow = ({ icon, empty = false, children }: Props) => (
  <div className={styles.row}>
    <div className={styles.iconBox}>
      <Icon
        name={icon}
        width="24px"
        height="24px"
        fill="currentColor"
        className={empty ? styles.iconEmpty : styles.icon}
      />
    </div>
    <div className={styles.content}>{children}</div>
  </div>
);

export default PreviewInfoRow;
