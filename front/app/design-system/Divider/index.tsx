import React from 'react';

import { Separator } from 'react-aria-components';

import '../tokens.css';

import styles from './Divider.module.css';

export type DividerProps = {
  'data-cy'?: string;
};

const Divider = ({ 'data-cy': dataCy }: DividerProps) => (
  <Separator className={styles.divider} data-cy={dataCy} />
);

export default Divider;
