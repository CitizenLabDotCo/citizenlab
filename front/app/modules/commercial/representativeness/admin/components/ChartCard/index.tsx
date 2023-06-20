import React, { useEffect, useRef, useState } from 'react';

// hooks
import useLocalize from 'hooks/useLocalize';
import useReferenceData from '../../hooks/useReferenceData';
import useRScore from '../../hooks/useRScore';

// services
import {
  usersByRegFieldXlsxEndpoint,
  usersByDomicileXlsxEndpoint,
} from 'services/userCustomFieldStats';

// components
import { Box } from '@citizenlab/cl2-component-library';
import EmptyCard from './EmptyCard';
import Header from './Header';
import Chart from './Chart';
import Table from './Table';
import Footer from './Footer';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';
import messages from './messages';
import fieldMessages from '../Field/messages';

// utils
import { getLegendLabels } from './utils';
import { isNilOrError } from 'utils/helperUtils';

// typings
import {
  IUserCustomFieldData,
  TCustomFieldCode,
} from 'api/user_custom_fields/types';
import {
  RepresentativenessRow,
  RepresentativenessRowMultiloc,
} from '../../hooks/createRefDataSubscription';
import { View } from 'components/admin/GraphCard/ViewToggle';
import { usersByAgeXlsxEndpoint } from 'api/users_by_age/util';
import { usersByGenderXlsxEndpoint } from 'api/users_by_gender/util';

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
