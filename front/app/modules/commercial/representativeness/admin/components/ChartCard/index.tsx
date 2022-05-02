import React, { useRef, useState } from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import Header, { ViewState } from './Header';
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
  const dataIsTooLong = data.length > 24;
  const numberOfHiddenItems = data.length - 24;

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
    <Box width="100%" background="white" mb="36px">
      <Header
        titleMultiloc={customField.attributes.title_multiloc}
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
      {viewState === 'table' && <Table legendLabels={legendLabels} />}
      <Footer
        fieldIsRequired={customField.attributes.required}
        includedUserPercentage={includedUserPercentage}
        hideTicks={hideTicks}
        dataIsTooLong={dataIsTooLong}
        numberOfHiddenItems={numberOfHiddenItems}
        legendLabels={legendLabels}
      />
    </Box>
  );
};

export default injectIntl(ChartCard);
