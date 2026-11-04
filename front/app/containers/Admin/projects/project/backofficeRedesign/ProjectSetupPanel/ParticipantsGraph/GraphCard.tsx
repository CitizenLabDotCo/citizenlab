import React, { useMemo } from 'react';

import { Box, Icon, Text, colors } from '@citizenlab/cl2-component-library';
import { parseISO } from 'date-fns';
import moment from 'moment';

import useParticipants from 'components/admin/GraphCards/ParticipantsCard/useParticipants';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from '../../messages';
import StatCardLink, { STAT_CARD_PADDING } from '../StatCardLink';

import EmptyCard from './EmptyCard';
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
    <StatCardLink
      to="/admin/projects/$projectId/audience"
      params={{ projectId }}
    >
      <Box
        display="flex"
        alignItems="flex-start"
        justifyContent="space-between"
        gap="8px"
      >
        <Box minWidth="0">
          <Text variant="boMicro">
            {formatMessage(messages.participantsGraphLabel)}
          </Text>
          <Text
            m="0"
            mt="2px"
            fontSize="xxl"
            fontWeight="bold"
            color="textPrimary"
          >
            {formatNumber(participants)}
          </Text>
          {lastPeriod > 0 && (
            <Text variant="boMicro" mt="2px">
              <FormattedMessage
                {...messages.participantsGraphLastPeriod}
                values={{
                  count: lastPeriod,
                  b: (chunks) => (
                    <Text
                      as="span"
                      m="0"
                      fontSize="xs"
                      fontWeight="bold"
                      color="green500"
                    >
                      {chunks}
                    </Text>
                  ),
                }}
              />
            </Text>
          )}
        </Box>
        <Icon
          name="chevron-right"
          width="16px"
          height="16px"
          fill={colors.textSecondary}
          my="0px"
        />
      </Box>

      {sinceDate && (
        <>
          <Box mt="8px" mx={`-${STAT_CARD_PADDING}px`}>
            <Sparkline values={weeks.map((week) => week.participants)} />
          </Box>
          <Text variant="boMicro" mt="4px">
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
