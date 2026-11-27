import React, { useId } from 'react';

import styles from './DemographicCard.module.css';
import '../tokens.css';

// Categories with no order, e.g. "Primary commute".
export const CATEGORICAL_COLORS = [1, 2, 3, 4, 5, 6, 7, 8].map(
  (index) => `var(--gv-chart-series-${index})`
);

// Categories in order, e.g. "Age group": light to dark.
export const SEQUENTIAL_COLORS = [1, 2, 3, 4, 5].map(
  (index) => `var(--gv-chart-sequential-${index})`
);

export type DemographicSegment = {
  label: string;
  // Between 0 and 1.
  share: number;
  // What the row says, for example "16%".
  value: string;
  color: string;
};

type Props = {
  title: string;
  segments: DemographicSegment[];
};

// How one demographic splits: a stacked bar, then a legend with each share.
const DemographicCard = ({ title, segments }: Props) => {
  const titleId = useId();
  const total = segments.reduce((sum, segment) => sum + segment.share, 0);

  return (
    <section className={styles.card} aria-labelledby={titleId}>
      <h3 id={titleId} className={styles.title}>
        {title}
      </h3>
      <span className={styles.bar} aria-hidden>
        {segments.map((segment) => (
          <span
            key={segment.label}
            className={styles.segment}
            style={{
              width: `${total > 0 ? (segment.share / total) * 100 : 0}%`,
              background: segment.color,
            }}
          />
        ))}
      </span>
      <ul className={styles.legend}>
        {segments.map((segment) => (
          <li key={segment.label} className={styles.row}>
            <span
              className={styles.swatch}
              style={{ background: segment.color }}
              aria-hidden
            />
            <span className={styles.label}>{segment.label}</span>
            <span className={styles.value}>{segment.value}</span>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default DemographicCard;
