import React, { useEffect, useRef, useState } from 'react';
import { WrappedComponentProps } from 'react-intl';
// components
import { Box } from '@citizenlab/cl2-component-library';
import {
  RepresentativenessRow,
  RepresentativenessRowMultiloc,
} from '../../hooks/createRefDataSubscription';
import useRScore from '../../hooks/useRScore';
import useReferenceData from '../../hooks/useReferenceData';
// hooks
import useLocalize from 'hooks/useLocalize';
// services
import {
  usersByRegFieldXlsxEndpoint,
  usersByGenderXlsxEndpoint,
  usersByDomicileXlsxEndpoint,
  usersByAgeXlsxEndpoint,
} from 'services/userCustomFieldStats';
// typings
import {
  IUserCustomFieldData,
  TCustomFieldCode,
} from 'services/userCustomFields';
// utils
import { getLegendLabels } from './utils';
// i18n
import { injectIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import { View } from 'components/admin/GraphCard/ViewToggle';
import fieldMessages from '../Field/messages';
import Chart from './Chart';
import EmptyCard from './EmptyCard';
import Footer from './Footer';
import Header from './Header';
import Table from './Table';
import messages from './messages';

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
    case 'birthyear':
      return usersByAgeXlsxEndpoint;
    default:
      return usersByRegFieldXlsxEndpoint(userCustomFieldId);
  }
};

const ChartCard = injectIntl(
  ({
    userCustomField,
    projectFilter,
    intl: { formatMessage },
  }: Props & WrappedComponentProps) => {
    const rScore = useRScore(userCustomField.id, projectFilter);
    const { referenceData, includedUsers } = useReferenceData(
      userCustomField,
      projectFilter
    );

    const currentChartRef = useRef<SVGElement>();
    const [view, setView] = useState<View | undefined>(
      isNilOrError(referenceData)
        ? undefined
        : referenceData.length > 12
        ? 'table'
        : 'chart'
    );

    useEffect(() => {
      if (view !== undefined) return;
      if (isNilOrError(referenceData)) return;

      setView(referenceData.length > 12 ? 'table' : 'chart');
    }, [referenceData, view]);

    const localize = useLocalize();

    if (
      isNilOrError(referenceData) ||
      isNilOrError(rScore) ||
      isNilOrError(includedUsers) ||
      view === undefined
    ) {
      return null;
    }

    const handleClickSwitchToTableView = () => setView('table');

    const hideTicks = referenceData.length > 12;
    const dataIsTooLong = referenceData.length > 24;
    const numberOfHiddenItems = referenceData.length - 24;
    const hideLegend = view === 'table';

    const barNames = [
      formatMessage(messages.users),
      formatMessage(messages.totalPopulation),
    ];

    const legendLabels = getLegendLabels(barNames);

    const title =
      userCustomField.attributes.key === 'birthyear'
        ? formatMessage(fieldMessages.birthyearCustomTitle)
        : localize(userCustomField.attributes.title_multiloc);

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
          view={view}
          projectFilter={projectFilter}
          xlsxEndpoint={xlsxEndpoint}
          onChangeView={setView}
        />
        {view === 'chart' && (
          <Chart
            currentChartRef={currentChartRef}
            data={data}
            barNames={barNames}
            hideTicks={hideTicks}
          />
        )}
        {view === 'table' && (
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
          view={view}
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
