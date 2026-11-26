import React, { ReactNode, useState } from 'react';

import { Icon, colors } from '@citizenlab/cl2-component-library';

import styles from './MovePhaseDateGroup.module.css';

interface Props {
  label: string;
  defaultOpen: boolean;
  children: ReactNode;
}

// The move modal also opens from the old timeline, so this card keeps the
// look it had there instead of the design system card.
const MovePhaseDateGroup = ({ label, defaultOpen, children }: Props) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={styles.group}>
      <section className={styles.card}>
        <h3 className={styles.heading}>
          <button
            type="button"
            className={styles.header}
            aria-expanded={open}
            onClick={() => setOpen((open) => !open)}
          >
            <span className={styles.titleBox}>
              <span className={styles.title}>{label}</span>
            </span>
            <span className={styles.iconBox} aria-hidden>
              <Icon
                name={open ? 'chevron-up' : 'chevron-down'}
                width="16px"
                height="16px"
                fill={colors.coolGrey500}
              />
            </span>
          </button>
        </h3>
        {open && <div className={styles.body}>{children}</div>}
      </section>
    </div>
  );
};

export default MovePhaseDateGroup;
