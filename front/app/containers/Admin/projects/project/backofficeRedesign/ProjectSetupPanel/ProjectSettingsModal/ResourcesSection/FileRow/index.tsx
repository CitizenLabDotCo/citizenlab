import React, { ReactNode } from 'react';

import Icon from 'design-system/Icon';
import 'design-system/tokens.css';

import { getFileIcon } from '../utils';

import styles from './FileRow.module.css';

interface Props {
  name: string;
  mimeType: string;
  meta?: ReactNode;
  status?: ReactNode;
  actions?: ReactNode;
}

const FileRow = ({ name, mimeType, meta, status, actions }: Props) => (
  <div className={styles.row}>
    <Icon name={getFileIcon(mimeType)} className={styles.icon} />
    <div className={styles.text}>
      <p className={styles.name}>{name}</p>
      {meta}
    </div>
    {status}
    <div className={styles.actions}>{actions}</div>
  </div>
);

export default FileRow;
