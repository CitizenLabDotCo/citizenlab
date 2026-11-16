import React, { ReactNode, useContext } from 'react';

import { TabList as AriaTabList } from 'react-aria-components';

import '../tokens.css';

import { StyleContext } from './context';
import styles from './VerticalTabs.module.css';

export type VerticalTabListProps = {
  // VerticalTab elements.
  children: ReactNode;
  'aria-label'?: string;
  'aria-labelledby'?: string;
};

const VerticalTabList = ({
  children,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}: VerticalTabListProps) => {
  const style = useContext(StyleContext);

  return (
    <AriaTabList
      className={`${styles.tabList} ${
        style === 'settings' ? styles.settingsColumn : ''
      }`}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
    >
      {children}
    </AriaTabList>
  );
};

export default VerticalTabList;
