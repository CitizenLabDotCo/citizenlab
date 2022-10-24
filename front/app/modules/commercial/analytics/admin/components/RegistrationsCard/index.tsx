import React from 'react';

// hooks
import useRegistrations from '../../hooks/useRegistrations';

// components
import GraphCard from 'components/admin/GraphCard';
import { Box } from '@citizenlab/cl2-component-library';
import Statistic from 'components/admin/Graphs/Statistic';

// i18n
import messages from './messages';
import { useIntl } from 'utils/cl-intl';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { BOTTOM_LABEL_COPY } from '../VisitorsCard/VisitorStats';

// typings
import { Moment } from 'moment';
import { IResolution } from 'components/admin/ResolutionControl';

interface Props {
  startAtMoment: Moment | null | undefined;
  endAtMoment: Moment | null;
  resolution: IResolution;
}

const RegistrationsCard = ({
  startAtMoment,
  endAtMoment,
  resolution,
}: Props) => {
  const { formatMessage } = useIntl();
  const { timeSeries, stats, xlsxData, deducedResolution } = useRegistrations({
    startAtMoment,
    endAtMoment,
    resolution,
  });

  if (isNilOrError(stats) || isNilOrError(timeSeries)) {
    return null;
  }

  const cardTitle = formatMessage(messages.registrations);
  const startAt = startAtMoment?.toISOString();
  const endAt = endAtMoment?.toISOString();
  const bottomLabel = formatMessage(BOTTOM_LABEL_COPY[resolution]);

  return (
    <GraphCard
      title={cardTitle}
      exportMenu={{
        name: cardTitle,
        xlsx: !isNilOrError(xlsxData) ? { data: xlsxData } : undefined,
        startAt,
        endAt,
        resolution: deducedResolution,
      }}
    >
      <Box px="20px">
        <Box>
          <Statistic
            name={formatMessage(messages.totalRegistrations)}
            value={stats.registrations.value}
            bottomLabel={bottomLabel}
            bottomLabelValue={stats.registrations.lastPeriod}
          />
          <Statistic
            name={formatMessage(messages.conversionRate)}
            value={stats.conversionRate.value}
            bottomLabel={bottomLabel}
            bottomLabelValue={stats.conversionRate.lastPeriod}
          />
        </Box>
      </Box>
    </GraphCard>
  );
};

export default RegistrationsCard;
