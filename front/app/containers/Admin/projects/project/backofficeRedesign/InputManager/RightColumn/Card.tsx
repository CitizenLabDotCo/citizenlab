import React, { ReactNode } from 'react';

import styles from './RightColumn.module.css';

interface Props {
  title: string;
  children: ReactNode;
}

const Card = ({ title, children }: Props) => (
  <section className={styles.card}>
    <h3 className={styles.cardTitle}>{title}</h3>
    {children}
  </section>
);

export default Card;
