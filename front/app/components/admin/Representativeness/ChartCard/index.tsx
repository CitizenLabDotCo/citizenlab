import React, { useEffect, useRef, useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { WrappedComponentProps } from 'react-intl';

import useRScore from 'api/r_score/useRScore';
import {
  IUserCustomFieldData,
  TCustomFieldCode,
} from 'api/user_custom_fields/types';
import { usersByAgeXlsxEndpoint } from 'api/users_by_age/util';
import { usersByCustomFieldXlsxEndpoint } from 'api/users_by_custom_field/util';

import useLocalize from 'hooks/useLocalize';

import { View } from 'components/admin/GraphCard/ViewToggle';

import { injectIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import {
  RepresentativenessRow,
  RepresentativenessRowMultiloc,
} from '../../../../hooks/parseReferenceData';
import useReferenceData from '../../../../hooks/useReferenceData';
import fieldMessages from '../Field/messages';

import Chart from './Chart';
import EmptyCard from './EmptyCard';
import Footer from './Footer';
import Header from './Header';
import messages from './messages';
import Table from './Table';
import { getLegendLabels } from './utils';

interface Props {
  userCustomField: IUserCustomFieldData;
  projectFilter?: string;
}

const getXlsxEndpoint = (
  code: TCustomFieldCode | null,
  userCustomFieldId: string
): string => {
  switch (code) {
    case 'birthyear':
      return usersByAgeXlsxEndpoint;
    default:
      return usersByCustomFieldXlsxEndpoint(userCustomFieldId);
  }
};

const ChartCard = injectIntl(
  ({
    userCustomField,
    projectFilter,
    intl: { formatMessage },
  }: Props & WrappedComponentProps) => {
    const { data: rScore } = useRScore({
      id: userCustomField.id,
      projectId: projectFilter,
    });
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
          rScore={rScore.data.attributes.score}
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
