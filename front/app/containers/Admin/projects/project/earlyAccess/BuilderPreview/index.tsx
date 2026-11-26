import React, { useLayoutEffect, useRef } from 'react';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

import styles from './BuilderPreview.module.css';

// A sample date for the chart caption.
const SAMPLE_START = new Date(2026, 4, 6);

const SPARK_LINE =
  'M0 44 L40 42 L84 38 L128 39 L170 32 L212 30 L252 31 L296 18 L344 16';

// A 12 s loop through Build, Manage and Insights, one small gesture each:
// the input term changes from its menu, a new idea arrives, the chart draws.
const BuilderPreview = () => {
  const { formatMessage, formatDate } = useIntl();
  const wordRef = useRef<HTMLSpanElement>(null);

  // The pill grows from one word to the next, so it needs both widths.
  useLayoutEffect(() => {
    const word = wordRef.current;
    if (!word) return;

    const [first, second] = Array.from(word.children);
    word.style.setProperty('--first-width', `${first.scrollWidth}px`);
    word.style.setProperty('--second-width', `${second.scrollWidth}px`);
  });

  return (
    <div
      className={styles.preview}
      role="img"
      aria-label={formatMessage(messages.previewLabel)}
    >
      <div className={styles.canvas} aria-hidden>
        <div className={styles.tabs}>
          <i className={styles.thumb} />
          <span className={`${styles.tab} ${styles.tab1}`}>
            {formatMessage(messages.previewBuild)}
          </span>
          <span className={`${styles.tab} ${styles.tab2}`}>
            {formatMessage(messages.previewManage)}
          </span>
          <span className={`${styles.tab} ${styles.tab3}`}>
            {formatMessage(messages.previewInsights)}
          </span>
        </div>

        <div className={`${styles.scene} ${styles.scene1}`}>
          <div className={styles.card}>
            <span>{formatMessage(messages.previewInputTermQuestion)}</span>
            <span className={styles.pillWrap}>
              <span className={styles.pill}>
                <svg viewBox="0 0 16 16" className={styles.pillIcon}>
                  <path d="M6 11.5h4M6.5 13.5h3M8 2.5a4 4 0 0 0-2.4 7.2c.3.3.4.6.4 1v.8h4v-.8c0-.4.1-.7.4-1A4 4 0 0 0 8 2.5z" />
                </svg>
                <span ref={wordRef} className={styles.word}>
                  <span className={styles.firstWord}>
                    {formatMessage(messages.previewIdea)}
                  </span>
                  <span className={styles.secondWord}>
                    {formatMessage(messages.previewProposal)}
                  </span>
                </span>
              </span>
              <span className={styles.menu}>
                <span>{formatMessage(messages.previewContribution)}</span>
                <span className={styles.pick}>
                  {formatMessage(messages.previewProposal)}
                </span>
                <span>{formatMessage(messages.previewQuestion)}</span>
              </span>
            </span>
            <svg viewBox="0 0 12 12" className={styles.chevron}>
              <path d="M3 4.5l3 3 3-3" />
            </svg>
          </div>
        </div>

        <div className={`${styles.scene} ${styles.scene2}`}>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statLabel}>
                {formatMessage(messages.previewWaitingForReply)}
              </span>
              <span className={styles.statNumber}>40</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>
                {formatMessage(messages.previewNewIdeas)}
                <i className={styles.dot} />
              </span>
              <span className={`${styles.statNumber} ${styles.count}`}>
                <span className={styles.countBefore}>17</span>
                <span className={styles.countAfter}>18</span>
              </span>
            </div>
          </div>
        </div>

        <div className={`${styles.scene} ${styles.scene3}`}>
          <div className={styles.participants}>
            <span className={styles.participantsLabel}>
              {formatMessage(messages.previewParticipants)}
            </span>
            <span className={styles.participantsNumber}>215</span>
            <svg
              className={styles.spark}
              viewBox="0 0 344 56"
              preserveAspectRatio="none"
            >
              <path
                className={styles.sparkArea}
                d={`${SPARK_LINE} L344 56 L0 56 Z`}
              />
              <path
                className={styles.sparkLine}
                pathLength={1}
                d={SPARK_LINE}
              />
            </svg>
            <span className={styles.participantsCaption}>
              {formatMessage(messages.previewWeekly, {
                date: formatDate(SAMPLE_START, {
                  day: 'numeric',
                  month: 'short',
                }),
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuilderPreview;
