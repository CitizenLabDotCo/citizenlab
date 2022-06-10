import React, { useEffect, useRef, useState } from 'react';

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
import {
  RepresentativenessRow,
  RepresentativenessRowPre,
} from '../../hooks/useReferenceData';

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
  const { referenceData, includedUserPercentage, referenceDataUploaded } =
    useReferenceData(customField, projectFilter);

  const currentChartRef = useRef<SVGElement>();
  const [viewState, setViewState] = useState<ViewState>('chart');
  const [hideTicks, setHideTicks] = useState<boolean>(false);

  useEffect(() => {
    if (!isNilOrError(referenceData) && referenceData.length > 12) {
      setViewState('table');
      setHideTicks(true);
    }
  }, [referenceData]);

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
    isNilOrError(referenceData) ||
    isNilOrError(includedUserPercentage) ||
    referenceDataUploaded === undefined
  ) {
    return null;
  }

  const handleClickSwitchToTableView = () => setViewState('table');

  const dataIsTooLong = referenceData.length > 24;
  const numberOfHiddenItems = referenceData.length - 24;
  const hideLegend = viewState === 'table';

  const barNames = [
    formatMessage(messages.users),
    formatMessage(messages.totalPopulation),
  ];

  const legendLabels = getLegendLabels(barNames);

  const title = localize(customField.attributes.title_multiloc);
  const fieldIsRequired = customField.attributes.required;
  const data = referenceData.map(
    (opt: RepresentativenessRowPre): RepresentativenessRow => {
      const { title_multiloc, ..._opt } = opt;
      return { ..._opt, name: localize(title_multiloc) };
    }
  );

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
