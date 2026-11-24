import React, { useMemo } from 'react';

import { parseISO } from 'date-fns';
import moment from 'moment';

import Icon from 'design-system/Icon';
import Text from 'design-system/Text';

import useParticipants from 'components/admin/GraphCards/ParticipantsCard/useParticipants';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import StatCardLink from '../StatCardLink';

import EmptyCard from './EmptyCard';
import messages from './messages';
import styles from './ParticipantsGraph.module.css';
import Sparkline from './Sparkline';

const MIN_WEEKS = 2;

interface Props {
  projectId: string;
}

const GraphCard = ({ projectId }: Props) => {
  const { formatMessage, formatDate, formatNumber } = useIntl();

  const endAtMoment = useMemo(() => moment(), []);

  const { timeSeries, stats } = useParticipants({
    projectId,
    startAtMoment: null,
    endAtMoment,
    resolution: 'week',
  });

  if (!stats) return null;

  const participants = Number(stats.participants.value);

  if (participants === 0) return <EmptyCard />;

  const weeks = timeSeries?.slice(0, -1) ?? [];
  const since = weeks.length >= MIN_WEEKS ? weeks[0].date : undefined;
  const sinceDate = since ? parseISO(since) : null;

  const lastPeriod = Number(stats.participants.lastPeriod);
  const sinceThisYear =
    !!sinceDate && sinceDate.getFullYear() === new Date().getFullYear();

  return (
    <StatCardLink projectId={projectId}>
      <div className={styles.head}>
        <div className={styles.summary}>
          <Text variant="small" tone="secondary">
            {formatMessage(messages.participantsGraphLabel)}
          </Text>
          <p className={styles.value}>{formatNumber(participants)}</p>
          {lastPeriod > 0 && (
            <Text
              variant="small"
              tone="secondary"
              className={styles.lastPeriod}
            >
              <FormattedMessage
                {...messages.participantsGraphLastPeriod}
                values={{
                  count: lastPeriod,
                  b: (chunks) => (
                    <Text as="span" variant="smallStrong" tone="success">
                      {chunks}
                    </Text>
                  ),
                }}
              />
            </Text>
          )}
        </div>
        <Icon name="chevron-right-16" className={styles.chevron} />
      </div>

      {sinceDate && (
        <>
          <div className={styles.sparkline}>
            <Sparkline values={weeks.map((week) => week.participants)} />
          </div>
          <Text variant="small" tone="secondary" className={styles.scale}>
            {formatMessage(messages.participantsGraphScale, {
              date: formatDate(sinceDate, {
                day: 'numeric',
                month: 'short',
                ...(sinceThisYear ? {} : { year: 'numeric' }),
              }),
            })}
          </Text>
        </>
      )}
    </StatCardLink>
  );
};

export default GraphCard;
