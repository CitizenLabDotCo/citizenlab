import React from 'react';

// hooks
import useVisitorsData, { Stats } from '../../hooks/useVisitorsData';

// components
import { Box } from '@citizenlab/cl2-component-library';
import Statistic from 'components/admin/Graphs/Statistic';

// i18n
import messages from './messages';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// utils
import { isNilOrError } from 'utils/helperUtils';

// typings
import { IResolution } from 'components/admin/ResolutionControl';
import { MessageDescriptor } from 'typings';

interface Props {
  resolution: IResolution;
}

const BOTTOM_LABEL_COPY: Record<IResolution, MessageDescriptor> = {
  month: messages.last30Days,
  week: messages.last7Days,
  day: messages.yesterday,
};

const EMPTY_STAT = { value: '-', lastPeriod: '-' };
const EMPTY_DATA: Stats = {
  visitors: EMPTY_STAT,
  visits: EMPTY_STAT,
  visitDuration: EMPTY_STAT,
  pageViews: EMPTY_STAT,
};

const VisitorStats = ({
  resolution,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const visitorData = useVisitorsData();
  const stats = isNilOrError(visitorData.stats)
    ? EMPTY_DATA
    : visitorData.stats;

  const bottomLabel = formatMessage(BOTTOM_LABEL_COPY[resolution]);

  return (
    <>
      <Box>
        <Statistic
          name={formatMessage(messages.visitors)}
          value={stats.visitors.value.toLocaleString()}
          bottomLabel={bottomLabel}
          bottomLabelValue={stats.visitors.lastPeriod}
        />
        <Box mt="32px">
          <Statistic
            name={formatMessage(messages.visitDuration)}
            value={stats.visitDuration.value.toLocaleString()}
            bottomLabel={bottomLabel}
            bottomLabelValue={stats.visitDuration.lastPeriod}
          />
        </Box>
      </Box>
      <Box ml="28px">
        <Statistic
          name={formatMessage(messages.visits)}
          value={stats.visits.value.toLocaleString()}
          bottomLabel={bottomLabel}
          bottomLabelValue={stats.visits.lastPeriod}
        />
        <Box mt="32px">
          <Statistic
            name={formatMessage(messages.pageViews)}
            value={stats.pageViews.value.toLocaleString()}
            bottomLabel={bottomLabel}
            bottomLabelValue={stats.pageViews.lastPeriod}
          />
        </Box>
      </Box>
    </>
  );
};

export default injectIntl(VisitorStats);
