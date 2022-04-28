import React, { useRef } from 'react';

// hooks
import { useTheme } from 'styled-components';

// components
import { Box } from '@citizenlab/cl2-component-library';
import Header from './Header';
import MultiBarChart from 'components/admin/Graphs/MultiBarChart';
import { DEFAULT_BAR_CHART_MARGIN } from 'components/admin/Graphs/constants';
import Footer from './Footer';
import { LabelList, Tooltip } from 'recharts';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../messages';

// typings
import { IUserCustomFieldData } from 'modules/commercial/user_custom_fields/services/userCustomFields';

// data
import { TEST_GENDER_DATA } from './data';

interface RepresentativenessRow {
  name: string;
  actualPercentage: number;
  referencePercentage: number;
  actualNumber: number;
  referenceNumber: number;
}

interface Props {
  customField: IUserCustomFieldData;
}

interface TooltipProps {
  dataKey?: 'actualPercentage' | 'referencePercentage';
  payload?: RepresentativenessRow;
}

const formatPercentage = (percentage: number) => `${percentage}%`;
const formatTooltipValues = (_, __, tooltipProps?: TooltipProps) => {
  if (!tooltipProps) return '?';

  const { dataKey, payload } = tooltipProps;
  if (!dataKey || !payload) return '?';

  const {
    actualPercentage,
    referencePercentage,
    actualNumber,
    referenceNumber,
  } = payload;

  return dataKey === 'actualPercentage'
    ? `${actualPercentage}% (${actualNumber})`
    : `${referencePercentage}% (${referenceNumber})`;
};

const ChartCard = ({
  customField,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const { newBarFill, secondaryNewBarFill }: any = useTheme();
  const currentChartRef = useRef<SVGElement>();

  const barNames = [
    formatMessage(messages.users),
    formatMessage(messages.totalPopulation),
  ];

  return (
    <Box width="100%" background="white">
      <Header
        titleMultiloc={customField.attributes.title_multiloc}
        svgNode={currentChartRef}
      />
      <MultiBarChart
        height={300}
        innerRef={currentChartRef}
        data={TEST_GENDER_DATA}
        mapping={{ length: ['actualPercentage', 'referencePercentage'] }}
        bars={{
          name: barNames,
          fill: [newBarFill, secondaryNewBarFill],
        }}
        margin={DEFAULT_BAR_CHART_MARGIN}
        yaxis={{ tickFormatter: formatPercentage }}
        renderLabels={(props) => (
          <LabelList {...props} formatter={formatPercentage} />
        )}
        renderTooltip={(props) => (
          <Tooltip {...props} formatter={formatTooltipValues} />
        )}
      />
      <Footer fieldIsRequired={customField.attributes.required} />
    </Box>
  );
};

export default injectIntl(ChartCard);
