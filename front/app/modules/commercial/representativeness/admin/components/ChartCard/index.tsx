import React, { useEffect, useRef, useState } from 'react';

// hooks
import useLocalize from 'hooks/useLocalize';
import useReferenceData, {
  RepresentativenessRow,
  RepresentativenessRowMultiloc,
} from '../../hooks/useReferenceData';
import useRScore from '../../hooks/useRScore';

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
  userCustomField: IUserCustomFieldData;
  projectFilter?: string;
}

const getXlsxEndpoint = (
  code: TCustomFieldCode | null,
  userCustomFieldId: string
): string => {
  switch (code) {
    case 'gender':
      return usersByGenderXlsxEndpoint;
    case 'domicile':
      return usersByDomicileXlsxEndpoint;
    default:
      return usersByRegFieldXlsxEndpoint(userCustomFieldId);
  }
};

const ChartCard = injectIntl(
  ({
    userCustomField,
    projectFilter,
    intl: { formatMessage },
  }: Props & InjectedIntlProps) => {
    const rScore = useRScore(userCustomField.id, projectFilter);
    const { referenceData, includedUsers } = useReferenceData(
      userCustomField,
      projectFilter
    );

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

    if (
      isNilOrError(referenceData) ||
      isNilOrError(rScore) ||
      isNilOrError(includedUsers) ||
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

    const title = localize(userCustomField.attributes.title_multiloc);
    const fieldIsRequired = userCustomField.attributes.required;
    const xlsxEndpoint = getXlsxEndpoint(
      userCustomField.attributes.code,
      userCustomField.id
    );

    const data = referenceData.map(
      (row: RepresentativenessRowMultiloc): RepresentativenessRow => {
        const { title_multiloc, ...rest } = row;
        return { ...rest, name: localize(title_multiloc) };
      }
    );

    return (
      <Box background="white" mb="36px" borderRadius="3px">
        <Header
          title={title}
          svgNode={currentChartRef}
          rScore={rScore.attributes.score}
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
            includedUsers={includedUsers}
            fieldIsRequired={fieldIsRequired}
            projectFilter={projectFilter}
            xlsxEndpoint={xlsxEndpoint}
          />
        )}
        <Footer
          fieldIsRequired={fieldIsRequired}
          includedUsers={includedUsers}
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
  }
);

const ChartCardWrapper = ({ userCustomField, projectFilter }: Props) => {
  const { referenceDataUploaded } = useReferenceData(
    userCustomField,
    projectFilter
  );

  if (referenceDataUploaded === undefined) return null;
  if (referenceDataUploaded === false) {
    return (
      <EmptyCard
        titleMultiloc={userCustomField.attributes.title_multiloc}
        isComingSoon={false}
      />
    );
  }

  return (
    <ChartCard
      userCustomField={userCustomField}
      projectFilter={projectFilter}
    />
  );
};

export default ChartCardWrapper;
