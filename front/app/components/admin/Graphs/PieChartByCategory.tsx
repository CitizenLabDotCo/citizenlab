import React, { useRef } from 'react';

import { IGraphFormat } from 'typings';

import { IUsersByCustomField } from 'api/users_by_custom_field/types';
import useUsersByCustomField from 'api/users_by_custom_field/useUsersByCustomField';

import messages from 'containers/Admin/dashboard/messages';
import renderTooltip from 'containers/Admin/dashboard/users/Charts/renderPieChartByCategoryTooltip';

import { LegendItem } from 'components/admin/Graphs/_components/Legend/typings';
import PieChart from 'components/admin/Graphs/PieChart';
import { categoricalColorScheme } from 'components/admin/Graphs/styling';
import {
  IGraphUnit,
  NoDataContainer,
  GraphCardHeader,
  GraphCardTitle,
  GraphCard,
  GraphCardInner,
  PieChartStyleFixesDiv,
} from 'components/admin/GraphWrappers';
import ReportExportMenu from 'components/admin/ReportExportMenu';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { roundPercentages } from 'utils/math';

interface Serie extends IGraphFormat {
  percentage: number;
}

interface Props {
  startAt: string | null | undefined;
  endAt: string | null;
  currentGroupFilter: string | undefined;
  currentGroupFilterLabel: string | undefined;
  graphTitleString: string;
  graphUnit: IGraphUnit;
  className?: string;
  customId: string;
  xlsxEndpoint: string;
  id: string;
  project?: string;
}

const PieChartByCategory = ({
  startAt,
  endAt,
  className,
  graphTitleString,
  xlsxEndpoint,
  currentGroupFilter,
  currentGroupFilterLabel,
  project,
  id,
}: Props) => {
  const { formatMessage } = useIntl();
  const currentChart = useRef<any>();
  const { data: usersByCustomField } = useUsersByCustomField({
    start_at: startAt,
    end_at: endAt,
    group: currentGroupFilter,
    project,
    id,
    enabled: true,
  });

  const convertCheckboxToGraphFormat = (data: IUsersByCustomField) => {
    const {
      series: { users },
    } = data.data.attributes;
    const res = ['_blank', 'true', 'false'].map((key) => ({
      value: users[key] || 0,
      name: formatMessage(messages[key]),
      code: 'key',
    }));

    return res.length > 0 ? res : null;
  };

  const serie =
    usersByCustomField && convertCheckboxToGraphFormat(usersByCustomField);

  const makeLegends = (row, i): LegendItem => ({
    icon: 'circle',
    color: categoricalColorScheme({ rowIndex: i }),
    label: `${row.name} (${row.percentage}%)`,
  });

  const addPercentages = (serie): Serie | undefined => {
    if (!serie) return;
    const percentages = roundPercentages(serie.map((row) => row.value));
    return serie.map((row, i) => ({
      ...row,
      percentage: percentages[i],
    }));
  };

  const percentagesSerie = addPercentages(serie);

  return (
    <GraphCard className={className}>
      <GraphCardInner>
        <GraphCardHeader>
          <GraphCardTitle>{graphTitleString}</GraphCardTitle>
          {serie && (
            <ReportExportMenu
              name={graphTitleString}
              svgNode={currentChart}
              xlsx={{ endpoint: xlsxEndpoint }}
              currentGroupFilter={currentGroupFilter}
              currentGroupFilterLabel={currentGroupFilterLabel}
              startAt={startAt}
              endAt={endAt}
              currentProjectFilter={project}
            />
          )}
        </GraphCardHeader>
        {!percentagesSerie ? (
          <NoDataContainer>
            <FormattedMessage {...messages.noData} />
          </NoDataContainer>
        ) : (
          <PieChartStyleFixesDiv>
            <PieChart
              data={percentagesSerie}
              width={164}
              mapping={{
                angle: 'value',
                name: 'name',
              }}
              pie={{
                startAngle: 0,
                endAngle: 360,
                outerRadius: 60,
              }}
              tooltip={renderTooltip()}
              legend={{
                items: percentagesSerie.map(makeLegends),
                maintainGraphSize: true,
                marginLeft: 50,
                position: 'right-center',
              }}
              innerRef={currentChart}
            />
          </PieChartStyleFixesDiv>
        )}
      </GraphCardInner>
    </GraphCard>
  );
};

export default PieChartByCategory;
