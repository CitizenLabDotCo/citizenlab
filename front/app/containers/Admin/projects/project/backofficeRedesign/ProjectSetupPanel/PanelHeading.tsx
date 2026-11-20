import React from 'react';

import PanelGroupHeader from 'design-system/PanelGroupHeader';

import styles from './PanelHeading.module.css';

interface Props {
  title: string;
  meta?: string;
}

const PanelHeading = ({ title, meta }: Props) => (
  <div className={styles.heading}>
    <PanelGroupHeader
      label={title}
      action={meta && <span className={styles.meta}>{meta}</span>}
    />
  </div>
);

export default PanelHeading;
