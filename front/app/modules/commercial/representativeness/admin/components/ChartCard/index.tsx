import React, { useEffect, useRef, useState } from 'react';

// hooks
import useLocalize from 'hooks/useLocalize';
import useReferenceData, {
  RepresentativenessRow,
  RepresentativenessRowMultiloc,
} from '../../hooks/useReferenceData';

// services
import {
  usersByRegFieldXlsxEndpoint,
  usersByGenderXlsxEndpoint,
  usersByDomicileXlsxEndpoint,
} from 'modules/commercial/user_custom_fields/services/stats';

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
import {
  IUserCustomFieldData,
  TCustomFieldCode,
} from 'modules/commercial/user_custom_fields/services/userCustomFields';

// utils
import { getLegendLabels } from './utils';
import { isNilOrError } from 'utils/helperUtils';

export type ViewState = 'chart' | 'table';

interface Props {
  customField: IUserCustomFieldData;
  projectFilter?: string;
}

const getXlsxEndpoint = (
  code: TCustomFieldCode | null,
  customFieldId: string
): string => {
  let xslxEndpoint: string;
  switch (code) {
    case 'gender':
      xslxEndpoint = usersByGenderXlsxEndpoint;
    case 'domicile':
      xslxEndpoint = usersByDomicileXlsxEndpoint;
    default:
      xslxEndpoint = usersByRegFieldXlsxEndpoint(customFieldId);
  }
  return xslxEndpoint;
};

const ChartCard = ({
  customField,
  projectFilter,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const { referenceData, includedUserPercentage, referenceDataUploaded } =
    useReferenceData(customField, projectFilter);

  const currentChartRef = useRef<SVGElement>();
  const [viewState, setViewState] = useState<ViewState | undefined>(
    isNilOrError(referenceData)
      ? undefined
      : referenceData.length > 12
      ? 'table'
      : 'chart'
  );

  useEffect(() => {
    if (viewState !== undefined) return;
    if (isNilOrError(referenceData)) return;

    setViewState(referenceData.length > 12 ? 'table' : 'chart');
  }, [referenceData, viewState]);

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
    referenceDataUploaded === undefined ||
    viewState === undefined
  ) {
    return null;
  }

  const handleClickSwitchToTableView = () => setViewState('table');

  const hideTicks = referenceData.length > 12;
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
  const xlsxEndpoint = getXlsxEndpoint(
    customField.attributes.code,
    customField.id
  );
  const data = referenceData.map(
    (opt: RepresentativenessRowMultiloc): RepresentativenessRow => {
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
        projectFilter={projectFilter}
        xlsxEndpoint={xlsxEndpoint}
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
          projectFilter={projectFilter}
          xlsxEndpoint={xlsxEndpoint}
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
