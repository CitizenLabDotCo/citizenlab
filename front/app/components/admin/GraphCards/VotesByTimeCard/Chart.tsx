import React, { useMemo } from 'react';

// styling
import { MARGINS } from 'components/admin/GraphCards/_utils/style';
import { legacyColors } from 'components/admin/Graphs/styling';

// components
import LineBarChart from 'components/admin/Graphs/LineBarChart';

// i18
import { useIntl } from 'utils/cl-intl';
import { getTranslations } from './useVotesByTime/translations';
import messages from 'containers/Admin/dashboard/messages';

// utils
import { isNilOrError, NilOrError } from 'utils/helperUtils';
import { toThreeLetterMonth } from 'utils/dateUtils';
import { generateEmptyData } from './generateEmptyData';

// typings
import { Dates, Resolution, Layout } from 'components/admin/GraphCards/typings';
import { LegendItem } from 'components/admin/Graphs/_components/Legend/typings';
import { TimeSeries } from './useVotesByTime/typings';

type Props = Dates &
  Resolution & {
    timeSeries: TimeSeries | NilOrError;
    innerRef?: React.RefObject<any>;
    layout?: Layout;
  };

const Chart = ({
  timeSeries,
  startAtMoment,
  endAtMoment,
  resolution,
  innerRef,
  layout = 'wide',
}: Props) => {
  const emptyData = useMemo(
    () => generateEmptyData(startAtMoment, endAtMoment, resolution),
    [startAtMoment, endAtMoment, resolution]
  );

  const { formatMessage } = useIntl();
  const translations = getTranslations(formatMessage);

  const legendItems: LegendItem[] = [
    {
      icon: 'line',
      color: legacyColors.line,
      label: formatMessage(messages.total),
    },
    {
      icon: 'rect',
      color: legacyColors.barFillLighter,
      label: translations.downvotes,
    },
    {
      icon: 'rect',
      color: legacyColors.barFill,
      label: translations.upvotes,
    },
  ];

  const formatTick = (date: string) => {
    return toThreeLetterMonth(date, resolution);
  };

  // Avoids unmounted component state update warning
  if (timeSeries === undefined) {
    return null;
  }

  const noData = isNilOrError(timeSeries);

  return (
    <LineBarChart
      width="100%"
      height="100%"
      data={noData ? emptyData : timeSeries}
      mapping={{
        x: 'date',
        yBars: ['downvotes', 'upvotes'],
        yLine: 'total',
      }}
      margin={MARGINS[layout]}
      xaxis={{ tickFormatter: formatTick }}
      legend={{
        marginTop: 16,
        items: legendItems,
      }}
      resolution={resolution}
      innerRef={noData ? undefined : innerRef}
    />
  );
};

export default Chart;
