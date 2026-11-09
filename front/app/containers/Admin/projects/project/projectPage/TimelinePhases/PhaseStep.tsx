import React, { ReactNode } from 'react';

import { Box, Text, bo, colors } from '@citizenlab/cl2-component-library';
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
  StepDot,
  StepLine,
  StepMeta,
  StepRow,
  StepTitle,
  phaseStatus,
  shortDateRange,
} from '../phaseRowUtils';

const LABEL_COLORS: Record<
  'timeline' | 'spotlight',
  Record<PhaseStatus, string>
> = {
  timeline: {
    past: bo.colors.stepDone,
    present: bo.colors.stepDone,
    future: colors.coolGrey600,
  },
  spotlight: {
    past: colors.green600,
    present: colors.primary,
    future: colors.coolGrey600,
  },
};

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

  return (
    <StepRow selected={selected}>
      {withLine && <StepLine status={status} />}
      <StepDot status={status} />
      <Box flexGrow={1} minWidth="0" pr={withOptions ? '24px' : '0'}>
        <StepTitle
          style={{
            color:
              status === 'future'
                ? bo.colors.stepUpcomingTitle
                : bo.colors.textHeadingStrong,
          }}
        >
          {localize(phase.attributes.title_multiloc)}
        </StepTitle>
        <StepMeta
          m={status === 'future' ? '2px 0 0 0' : '8px 0 0 0'}
          color="textSecondary"
        >
          <Text
            as="span"
            m="0"
            style={{
              color: LABEL_COLORS[placement][status],
              fontWeight: status === 'present' ? 500 : 400,
            }}
          >
            {formatMessage(STATUS_LABELS[status])}
          </Text>
          {' · '}
          {dates}
          {' · '}
          {formatMessage(METHOD_LABELS[participation_method])}
          {extraMeta}
        </StepMeta>
      </Box>
    </StepRow>
  );
};

export default PhaseStep;
