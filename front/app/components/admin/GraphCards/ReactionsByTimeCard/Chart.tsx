import React, { useMemo } from 'react';

import messages from 'containers/Admin/dashboard/messages';

import { MARGINS } from 'components/admin/GraphCards/_utils/style';
import { Dates, Resolution, Layout } from 'components/admin/GraphCards/typings';
import { LegendItem } from 'components/admin/Graphs/_components/Legend/typings';
import LineBarChart from 'components/admin/Graphs/LineBarChart';
import { legacyColors } from 'components/admin/Graphs/styling';

// i18
import { useIntl } from 'utils/cl-intl';
import { toThreeLetterMonth } from 'utils/dateUtils';
import { isNilOrError, NilOrError } from 'utils/helperUtils';

import { generateEmptyData } from './generateEmptyData';
import { getTranslations } from './useReactionsByTime/translations';
import { TimeSeries } from './useReactionsByTime/typings';

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
      label: translations.dislikes,
    },
    {
      icon: 'rect',
      color: legacyColors.barFill,
      label: translations.likes,
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
        yBars: ['dislikes', 'likes'],
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
