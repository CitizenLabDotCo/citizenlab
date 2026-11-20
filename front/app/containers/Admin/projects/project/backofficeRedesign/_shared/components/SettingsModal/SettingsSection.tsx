import React from 'react';

import styles from './SettingsSection.module.css';
import 'design-system/tokens.css';

interface Props {
  title: string;
  titleVariant?: 'heading' | 'label';
  description?: React.ReactNode;
  action?: React.ReactNode;
  children?: React.ReactNode;
}

const SettingsSection = ({
  title,
  titleVariant = 'heading',
  description,
  action,
  children,
}: Props) => (
  <section>
    <div className={styles.header}>
      <div className={styles.text}>
        <h3
          className={titleVariant === 'heading' ? styles.heading : styles.label}
        >
          {title}
        </h3>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      {action && <div className={styles.action}>{action}</div>}
    </div>
    {children && <div className={styles.content}>{children}</div>}
  </section>
);

export default SettingsSection;
