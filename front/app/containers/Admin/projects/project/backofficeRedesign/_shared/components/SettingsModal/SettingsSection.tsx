import React from 'react';

import Text from 'design-system/Text';

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
        <Text
          as="h3"
          variant={titleVariant === 'heading' ? 'uiStrong' : 'ui'}
          tone={titleVariant === 'heading' ? 'primary' : 'secondary'}
        >
          {title}
        </Text>
        {description && (
          <Text variant="small" tone="secondary" className={styles.description}>
            {description}
          </Text>
        )}
      </div>
      {action && <div className={styles.action}>{action}</div>}
    </div>
    {children && <div className={styles.content}>{children}</div>}
  </section>
);

export default SettingsSection;
