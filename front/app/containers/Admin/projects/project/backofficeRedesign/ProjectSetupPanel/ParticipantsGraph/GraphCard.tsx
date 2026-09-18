import React, { useMemo } from 'react';

import {
  Box,
  Icon,
  Text,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import { parseISO } from 'date-fns';
import moment from 'moment';

import useParticipants from 'components/admin/GraphCards/ParticipantsCard/useParticipants';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import Link, { typedStyled } from 'utils/cl-router/Link';

import messages from '../../messages';

import Sparkline from './Sparkline';

const CARD_PADDING = 12;

const MIN_WEEKS = 2;

const Card = typedStyled(Link)`
  display: block;
  margin: 10px 0 12px;
  padding: ${CARD_PADDING}px;
  border: 1px solid ${colors.grey200};
  border-radius: ${stylingConsts.borderRadius};
  background: ${colors.grey50};
  text-decoration: none;
  transition: background 80ms ease-out;

  &:hover {
    background: ${colors.grey100};
  }
`;

interface Props {
  projectId: string;
}

const GraphCard = ({ projectId }: Props) => {
  const { formatMessage, formatDate } = useIntl();

  const endAtMoment = useMemo(() => moment(), []);

  const { timeSeries, stats } = useParticipants({
    projectId,
    startAtMoment: null,
    endAtMoment,
    resolution: 'week',
  });

  if (!stats || Number(stats.participants.value) === 0) return null;

  const weeks = timeSeries?.slice(0, -1) ?? [];
  const since = weeks[0]?.date;
  const showGraph = weeks.length >= MIN_WEEKS && !!since;

  const lastPeriod = Number(stats.participants.lastPeriod);
  const sinceThisYear =
    !!since && parseISO(since).getFullYear() === new Date().getFullYear();

  return (
    <Card to="/admin/projects/$projectId/audience" params={{ projectId }}>
      <Box
        display="flex"
        alignItems="flex-start"
        justifyContent="space-between"
        gap="8px"
      >
        <Box minWidth="0">
          <Text m="0" fontSize="xs" color="coolGrey600">
            {formatMessage(messages.participantsGraphLabel)}
          </Text>
          <Text
            m="0"
            mt="2px"
            fontSize="xxl"
            fontWeight="bold"
            color="textPrimary"
          >
            {stats.participants.value}
          </Text>
          {lastPeriod > 0 && (
            <Text m="0" mt="2px" fontSize="xs" color="coolGrey600">
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

      {showGraph && (
        <>
          <Box mt="8px" mx={`-${CARD_PADDING}px`}>
            <Sparkline values={weeks.map((week) => week.participants)} />
          </Box>
          <Text m="0" mt="4px" fontSize="xs" color="coolGrey500">
            {formatMessage(messages.participantsGraphScale, {
              date: formatDate(since, {
                day: 'numeric',
                month: 'short',
                ...(sinceThisYear ? {} : { year: 'numeric' }),
              }),
            })}
          </Text>
        </>
      )}
    </Card>
  );
};

export default GraphCard;
