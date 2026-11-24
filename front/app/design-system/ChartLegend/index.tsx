import React from 'react';

import styles from './ChartLegend.module.css';
import '../tokens.css';

type Item = {
  label: string;
  // The colour of the series in the chart.
  color: string;
};

type Props = {
  items: Item[];
};

const ChartLegend = ({ items }: Props) => (
  <ul className={styles.legend}>
    {items.map((item) => (
      <li key={item.label} className={styles.item}>
        <span
          className={styles.dot}
          style={{ background: item.color }}
          aria-hidden
        />
        {item.label}
      </li>
    ))}
  </ul>
);

export default ChartLegend;
