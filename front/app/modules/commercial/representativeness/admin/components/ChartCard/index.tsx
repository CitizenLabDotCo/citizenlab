import React, { useRef, useState } from 'react';

// hooks
import useLocalize from 'hooks/useLocalize';
import useReferenceData from '../../hooks/useReferenceData';

// components
import { Box } from '@citizenlab/cl2-component-library';
import EmptyCard from './EmptyCard';
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

// utils
import { getLegendLabels } from './utils';
import { isNilOrError } from 'utils/helperUtils';

export type ViewState = 'chart' | 'table';

interface Props {
  customField: IUserCustomFieldData;
  projectFilter?: string;
}

const ChartCard = ({
  customField,
  projectFilter,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const {
    referenceData: data,
    includedUserPercentage,
    uploadDate,
    referenceDataUploaded,
  } = useReferenceData(customField, projectFilter);

  const hideTicks = isNilOrError(data) ? undefined : data.length > 12;

  const preferTableView = hideTicks;

  const currentChartRef = useRef<SVGElement>();
  const [viewState, setViewState] = useState<ViewState | undefined>(
    preferTableView === undefined
      ? undefined
      : preferTableView
      ? 'table'
      : 'chart'
  );

  const localize = useLocalize();

  if (referenceDataUploaded === false) {
    return (
      <EmptyCard
        titleMultiloc={customField.attributes.title_multiloc}
        isComingSoon={false}
      />
    );
  }

  if (
    isNilOrError(data) ||
    isNilOrError(includedUserPercentage) ||
    isNilOrError(uploadDate) ||
    referenceDataUploaded === undefined ||
    hideTicks === undefined ||
    viewState === undefined
  ) {
    return null;
  }

  const handleClickSwitchToTableView = () => setViewState('table');

  const dataIsTooLong = data.length > 24;
  const numberOfHiddenItems = data.length - 24;
  const hideLegend = viewState === 'table';

  const barNames = [
    formatMessage(messages.users),
    formatMessage(messages.totalPopulation),
  ];

  const legendLabels = getLegendLabels(barNames, uploadDate);

  const title = localize(customField.attributes.title_multiloc);
  const fieldIsRequired = customField.attributes.required;

  return (
    <Box background="white" mb="36px" borderRadius="3px">
      <Header
        title={title}
        svgNode={currentChartRef}
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
          title={title}
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
        onClickSwitchToTableView={handleClickSwitchToTableView}
      />
    </Box>
  );
};

export default injectIntl(ChartCard);
