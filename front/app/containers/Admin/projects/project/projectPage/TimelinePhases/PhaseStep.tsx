import React, { ReactNode } from 'react';

import { format } from 'date-fns';

import { IPhaseData } from 'api/phases/types';

import useLocale from 'hooks/useLocale';
import useLocalize from 'hooks/useLocalize';

import { getLocale } from 'components/admin/DatePickers/_shared/locales';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';
import {
  METHOD_LABELS,
  PhaseStatus,
  STATUS_LABELS,
  phaseStatus,
  shortDateRange,
} from '../phaseRowUtils';

import styles from './PhaseStep.module.css';
import 'design-system/tokens.css';

const DOT_CLASSES: Record<PhaseStatus, string> = {
  past: styles.dotPast,
  present: styles.dotPresent,
  future: styles.dotFuture,
};

const LABEL_CLASSES: Record<
  'timeline' | 'spotlight',
  Record<PhaseStatus, string | undefined>
> = {
  timeline: {
    past: styles.timelineDone,
    present: styles.timelineDone,
    future: undefined,
  },
  spotlight: {
    past: styles.spotlightPast,
    present: styles.spotlightPresent,
    future: undefined,
  },
};

const classNames = (...names: (string | false | undefined)[]) =>
  names.filter(Boolean).join(' ');

interface Props {
  phase: IPhaseData;
  placement: 'timeline' | 'spotlight';
  selected: boolean;
  withLine: boolean;
  withOptions: boolean;
  extraMeta?: ReactNode;
}

const PhaseStep = ({
  phase,
  placement,
  selected,
  withLine,
  withOptions,
  extraMeta,
}: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const locale = getLocale(useLocale());
  const status = phaseStatus(phase);
  const { start_at, end_at, participation_method } = phase.attributes;

  const dates = end_at
    ? formatMessage(
        messages.phaseDateRange,
        shortDateRange(start_at, end_at, locale)
      )
    : formatMessage(messages.phaseOpenEnded, {
        startDate: format(new Date(start_at), 'd MMM', { locale }),
      });

  const isFuture = status === 'future';

  return (
    <div className={styles.row}>
      {withLine && (
        <div
          className={classNames(
            styles.line,
            status === 'past' && styles.linePast
          )}
        />
      )}
      <div className={classNames(styles.dot, DOT_CLASSES[status])} />
      <div
        className={classNames(styles.body, withOptions && styles.withOptions)}
      >
        <p
          className={classNames(
            styles.title,
            isFuture && !selected && styles.titleFuture
          )}
        >
          {localize(phase.attributes.title_multiloc)}
        </p>
        <p className={styles.meta}>
          <span
            className={classNames(
              styles.status,
              LABEL_CLASSES[placement][status],
              status === 'present' && styles.statusPresent
            )}
          >
            {formatMessage(STATUS_LABELS[status])}
          </span>
          {' · '}
          {dates}
          {' · '}
          {formatMessage(METHOD_LABELS[participation_method])}
          {extraMeta}
        </p>
      </div>
    </div>
  );
};

export default PhaseStep;
