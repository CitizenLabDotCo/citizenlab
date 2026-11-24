import React from 'react';

import useCommonGroundResults from 'api/common_ground/useCommonGroundResults';
import { IPhaseData } from 'api/phases/types';

import { useIntl } from 'utils/cl-intl';

import messages from '../../CommonGroundManager/messages';

import styles from './SidePanel.module.css';

interface Props {
  phase: IPhaseData | undefined;
  ideaId: string;
}

const CommonGroundReactions = ({ phase, ideaId }: Props) => {
  const { formatMessage } = useIntl();
  const isCommonGround =
    phase?.attributes.participation_method === 'common_ground';
  const { data: results } = useCommonGroundResults(
    isCommonGround ? phase.id : undefined
  );
  if (!isCommonGround || !results) return null;

  const { stats, ideas_by_agreement } = results.data.attributes;
  const votes = ideas_by_agreement.find((idea) => idea.id === ideaId)?.votes;
  const agree = votes?.up ?? 0;
  const disagree = votes?.down ?? 0;
  const unsure = votes?.neutral ?? 0;
  const seen = agree + disagree + unsure;
  const total = Math.max(stats.num_participants, seen);
  const parts = [
    {
      label: formatMessage(messages.agree),
      count: agree,
      className: styles.agree,
    },
    {
      label: formatMessage(messages.disagree),
      count: disagree,
      className: styles.disagree,
    },
    {
      label: formatMessage(messages.unsure),
      count: unsure,
      className: styles.unsure,
    },
    {
      label: formatMessage(messages.notSeenYet),
      count: total - seen,
      className: styles.notSeen,
    },
  ];
  const share = (count: number) => (total ? (count / total) * 100 : 0);

  return (
    <div data-cy="e2e-common-ground-reactions">
      <div className={styles.agreementBar} aria-hidden>
        {parts.map((part) => (
          <span
            key={part.label}
            className={part.className}
            style={{ width: `${share(part.count)}%` }}
          />
        ))}
      </div>
      <div className={styles.agreementLegend}>
        {parts.map((part) => (
          <div key={part.label} className={styles.agreementRow}>
            <span
              className={`${styles.agreementDot} ${part.className}`}
              aria-hidden
            />
            <span className={styles.agreementLabel}>{part.label}</span>
            <span>{part.count}</span>
            <span className={styles.agreementShare}>
              {Math.round(share(part.count))}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommonGroundReactions;
