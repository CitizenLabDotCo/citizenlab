import React from 'react';

// hooks
import useVisitorsData from '../../hooks/useVisitorsData';

// styling
import { colors } from 'components/admin/Graphs/styling';

// components
import { Box } from '@citizenlab/cl2-component-library';
import LineChart from 'components/admin/Graphs/LineChart';
import renderTooltip from './renderTooltip';

// i18n
import messages from './messages';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { toThreeLetterMonth } from 'utils/dateUtils';

// typings
import { IResolution } from 'components/admin/ResolutionControl';
import { LegendItem } from 'components/admin/Graphs/_components/Legend/typings';

interface Props {
  resolution: IResolution;
}

const Chart = ({
  resolution,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const { timeSeries } = useVisitorsData();
  if (isNilOrError(timeSeries)) return null;

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
    <Box pt="12px" width="90%" maxWidth="900px" minHeight="300px">
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
      />
    </Box>
  );
};

export default injectIntl(Chart);
