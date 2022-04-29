import React, { useRef, useState } from 'react';

// hooks
import { useTheme } from 'styled-components';

// components
import { Box } from '@citizenlab/cl2-component-library';
import Header, { ViewState } from './Header';
import MultiBarChart from 'components/admin/Graphs/MultiBarChart';
import { DEFAULT_BAR_CHART_MARGIN } from 'components/admin/Graphs/constants';
import Footer from './Footer';
import { LabelList, Tooltip } from 'recharts';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// typings
import { IUserCustomFieldData } from 'modules/commercial/user_custom_fields/services/userCustomFields';
import { Moment } from 'moment';

// utils
import {
  getLegendLabels,
  formatPercentage,
  formatTooltipValues,
  emptyString,
} from './utils';

export interface RepresentativenessRow {
  name: string;
  actualPercentage: number;
  referencePercentage: number;
  actualNumber: number;
  referenceNumber: number;
}

export type RepresentativenessData = RepresentativenessRow[];

interface Props {
  customField: IUserCustomFieldData;
  data: RepresentativenessData;
  representativenessScore: number;
  includedUserPercentage: number;
  demographicDataDate: Moment;
}

const ChartCard = ({
  customField,
  data,
  representativenessScore,
  includedUserPercentage,
  demographicDataDate,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const hideTicks = data.length > 12;
  const preferTableView = hideTicks;
  const hideLabels = data.length > 10;
  const dataIsTooLong = data.length > 24;
  const slicedData = data.slice(0, 24);
  const numberOfHiddenItems = data.length - 24;

  const { newBarFill, secondaryNewBarFill }: any = useTheme();
  const currentChartRef = useRef<SVGElement>();
  const [viewState, setViewState] = useState<ViewState>(
    preferTableView ? 'table' : 'chart'
  );

  const barNames = [
    formatMessage(messages.users),
    formatMessage(messages.totalPopulation),
  ];

  const legendLabels = getLegendLabels(barNames, demographicDataDate);

  return (
    <Box width="100%" background="white">
      <Header
        titleMultiloc={customField.attributes.title_multiloc}
        svgNode={currentChartRef}
        representativenessScore={representativenessScore}
        viewState={viewState}
        onChangeViewState={setViewState}
      />
      <MultiBarChart
        height={300}
        innerRef={currentChartRef}
        data={slicedData}
        mapping={{ length: ['actualPercentage', 'referencePercentage'] }}
        bars={{
          name: barNames,
          fill: [newBarFill, secondaryNewBarFill],
          categoryGap: '20%',
        }}
        margin={DEFAULT_BAR_CHART_MARGIN}
        xaxis={
          hideTicks
            ? { tickFormatter: emptyString, tickLine: false }
            : undefined
        }
        yaxis={{ tickFormatter: formatPercentage }}
        renderLabels={
          hideLabels
            ? undefined
            : (props) => <LabelList {...props} formatter={formatPercentage} />
        }
        renderTooltip={(props) => (
          <Tooltip {...props} formatter={formatTooltipValues} />
        )}
      />
      <Footer
        fieldIsRequired={customField.attributes.required}
        includedUserPercentage={includedUserPercentage}
        hideTicks={hideTicks}
        dataIsTooLong={dataIsTooLong}
        numberOfHiddenItems={numberOfHiddenItems}
        legendLabels={legendLabels}
        legendColors={[newBarFill, secondaryNewBarFill]}
      />
    </Box>
  );
};

export default injectIntl(ChartCard);
