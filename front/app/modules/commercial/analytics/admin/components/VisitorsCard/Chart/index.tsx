import React from 'react';

// hooks
import useVisitorsData from '../../../hooks/useVisitorsData';

// styling
import { colors } from 'components/admin/Graphs/styling';

// components
import { Box } from '@citizenlab/cl2-component-library';
import LineChart from 'components/admin/Graphs/LineChart';
import renderTooltip from './renderTooltip';

// i18n
import messages from '../messages';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// utils
import { hasNoData } from 'components/admin/Graphs/utils';
import { toThreeLetterMonth } from 'utils/dateUtils';
import { generateEmptyData } from './generateEmptyData';

// typings
import { IResolution } from 'components/admin/ResolutionControl';
import { LegendItem } from 'components/admin/Graphs/_components/Legend/typings';

interface Props {
  resolution: IResolution;
  innerRef: React.RefObject<any>
}

const EMPTY_DATA = generateEmptyData();

const Chart = ({
  resolution,
  innerRef,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const { timeSeries } = useVisitorsData();

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

  return (
    <Box pt="8px" width="90%" maxWidth="900px" height="250px">
      {hasNoData(timeSeries) && (
        <LineChart
          width="100%"
          height="100%"
          data={EMPTY_DATA}
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

      {!hasNoData(timeSeries) && (
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
