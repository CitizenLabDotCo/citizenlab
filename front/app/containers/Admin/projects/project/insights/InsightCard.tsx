import React, { ReactNode, useId } from 'react';

import styles from './InsightCard.module.css';
import 'design-system/tokens.css';

interface Props {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
}

const InsightCard = ({ title, actions, children }: Props) => {
  const titleId = useId();

  return (
    <section className={styles.card} aria-labelledby={titleId}>
      <div className={styles.header}>
        <h3 id={titleId} className={styles.title}>
          {title}
        </h3>
        {actions}
      </div>
      {children}
    </section>
  );
};

export default InsightCard;
