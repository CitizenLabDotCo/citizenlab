import React, { useMemo } from 'react';

// styling
import { colors } from 'components/admin/Graphs/styling';

// components
import { Box } from '@citizenlab/cl2-component-library';
import LineChart from 'components/admin/Graphs/LineChart';
import renderTooltip from './renderTooltip';

// i18n
import { WrappedComponentProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from '../messages';

// utils
import { toThreeLetterMonth } from 'utils/dateUtils';
import { isNilOrError, NilOrError } from 'utils/helperUtils';
import { generateEmptyData } from './generateEmptyData';

// typings
import { LegendItem } from 'components/admin/Graphs/_components/Legend/typings';
import { IResolution } from 'components/admin/ResolutionControl';
import { Moment } from 'moment';
import { TimeSeries } from '../../../hooks/useVisitorsData/typings';

interface Props {
  timeSeries: TimeSeries | NilOrError;
  startAtMoment: Moment | null | undefined;
  endAtMoment: Moment | null | undefined;
  resolution: IResolution;
  innerRef: React.RefObject<any>;
}

const Chart = ({
  timeSeries,
  startAtMoment,
  endAtMoment,
  resolution,
  innerRef,
  intl: { formatMessage },
}: Props & WrappedComponentProps) => {
  const emptyData = useMemo(
    () => generateEmptyData(startAtMoment, endAtMoment, resolution),
    [startAtMoment, endAtMoment, resolution]
  );

  const legendItems: LegendItem[] = [
    {
      icon: 'circle',
      color: colors.categorical01,
      label: formatMessage(messages.visitors),
    },
    {
      icon: 'circle',
      color: colors.categorical03,
      label: formatMessage(messages.visits),
    },
  ];

  const formatTick = (date: string) => {
    return toThreeLetterMonth(date, resolution);
  };

  // Avoids unmounted component state update warning
  if (timeSeries === undefined) {
    return null;
  }

  return (
    <Box pt="8px" width="90%" maxWidth="900px" height="250px">
      {isNilOrError(timeSeries) && (
        <LineChart
          width="100%"
          height="100%"
          data={emptyData}
          mapping={{
            x: 'date',
            y: ['visits'],
          }}
          lines={{
            strokeWidths: [0],
          }}
          grid={{ vertical: true }}
          xaxis={{ tickFormatter: formatTick }}
          legend={{
            marginTop: 16,
            items: legendItems,
          }}
        />
      )}

      {!isNilOrError(timeSeries) && (
        <LineChart
          width="100%"
          height="100%"
          data={timeSeries}
          mapping={{
            x: 'date',
            y: ['visitors', 'visits'],
          }}
          lines={{
            strokes: [colors.categorical01, colors.categorical03],
            activeDot: { r: 4 },
          }}
          grid={{ vertical: true }}
          xaxis={{ tickFormatter: formatTick }}
          tooltip={renderTooltip(resolution)}
          legend={{
            marginTop: 16,
            items: legendItems,
          }}
          innerRef={innerRef}
        />
      )}
    </Box>
  );
};

export default injectIntl(Chart);
