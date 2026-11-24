import React, { ReactNode, useId } from 'react';

import Icon, { IconName } from '../Icon';

import styles from './DashboardCard.module.css';
import '../tokens.css';

type Props = {
  title: string;
  // Sits before the title, for example the sparkles of an AI summary.
  icon?: IconName;
  // One line under the title.
  description?: ReactNode;
  // Sits at the end of the header, for example a download Icon button.
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
};

const DashboardCard = ({
  title,
  icon,
  description,
  actions,
  children,
  className,
}: Props) => {
  const titleId = useId();

  return (
    <section
      className={`${styles.card} ${className ?? ''}`}
      aria-labelledby={titleId}
    >
      <div className={styles.header}>
        <div className={styles.heading}>
          <h3 id={titleId} className={styles.title}>
            {icon && <Icon name={icon} className={styles.icon} />}
            {title}
          </h3>
          {description && <p className={styles.description}>{description}</p>}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
};

export default DashboardCard;
