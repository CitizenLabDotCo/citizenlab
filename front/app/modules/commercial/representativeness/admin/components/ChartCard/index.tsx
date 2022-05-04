import React, { useRef, useState } from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import Header from './Header';
import Chart from './Chart';
import Table from './Table';
import Footer from './Footer';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// typings
import { IUserCustomFieldData } from 'modules/commercial/user_custom_fields/services/userCustomFields';
import { Moment } from 'moment';

// utils
import { getLegendLabels } from './utils';

export type ViewState = 'chart' | 'table';

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

  const currentChartRef = useRef<SVGElement>();
  const [viewState, setViewState] = useState<ViewState>(
    preferTableView ? 'table' : 'chart'
  );

  const dataIsTooLong = data.length > 24;
  const numberOfHiddenItems = data.length - 24;
  const hideLegend = viewState === 'table';

  const barNames = [
    formatMessage(messages.users),
    formatMessage(messages.totalPopulation),
  ];

  const legendLabels = getLegendLabels(barNames, demographicDataDate);

  const titleMultiloc = customField.attributes.title_multiloc;
  const fieldIsRequired = customField.attributes.required;

  return (
    <Box width="100%" background="white" mb="36px">
      <Header
        titleMultiloc={titleMultiloc}
        svgNode={currentChartRef}
        representativenessScore={representativenessScore}
        viewState={viewState}
        onChangeViewState={setViewState}
      />
      {viewState === 'chart' && (
        <Chart
          currentChartRef={currentChartRef}
          data={data}
          barNames={barNames}
          hideTicks={hideTicks}
        />
      )}
      {viewState === 'table' && (
        <Table
          titleMultiloc={titleMultiloc}
          data={data}
          legendLabels={legendLabels}
          includedUserPercentage={includedUserPercentage}
          fieldIsRequired={fieldIsRequired}
          svgNode={currentChartRef}
        />
      )}
      <Footer
        fieldIsRequired={fieldIsRequired}
        includedUserPercentage={includedUserPercentage}
        hideTicks={hideTicks}
        dataIsTooLong={dataIsTooLong}
        numberOfHiddenItems={numberOfHiddenItems}
        viewState={viewState}
        legendLabels={legendLabels}
        hideLegend={hideLegend}
      />
    </Box>
  );
};

export default injectIntl(ChartCard);
