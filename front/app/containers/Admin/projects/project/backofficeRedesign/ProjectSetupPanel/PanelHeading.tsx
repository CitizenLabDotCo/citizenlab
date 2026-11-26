import React from 'react';

import PanelGroupHeader from 'design-system/PanelGroupHeader';
import Text from 'design-system/Text';

import styles from './PanelHeading.module.css';

interface Props {
  title: string;
  meta?: string;
}

const PanelHeading = ({ title, meta }: Props) => (
  <div className={styles.heading}>
    <PanelGroupHeader
      label={title}
      action={
        meta && (
          <Text as="span" variant="ui" tone="secondary">
            {meta}
          </Text>
        )
      }
    />
  </div>
);

export default PanelHeading;
