import React, { useRef } from 'react';

// hooks
import useVisitorsLanguageData from '../../hooks/useVisitorsLanguageData';

// components
import GraphCard from 'components/admin/GraphCard';
import PieChart from 'components/admin/Graphs/PieChart';
import { Box } from '@citizenlab/cl2-component-library';
import EmptyPieChart from '../EmptyPieChart';

// i18n
import messages from './messages';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// typings
import { IResolution } from 'components/admin/ResolutionControl';
import { Moment } from 'moment';
import { isNilOrError } from 'utils/helperUtils';
import { LegendItem } from 'components/admin/Graphs/_components/Legend/typings';

// utils
import { hasNoData } from 'components/admin/Graphs/utils';
import renderTooltip from './renderTooltip';
interface Props {
  startAtMoment: Moment | null | undefined;
  endAtMoment: Moment | null;
  projectFilter: string | undefined;
  resolution: IResolution;
}

const VisitorsCard = ({
  startAtMoment,
  endAtMoment,
  projectFilter,
  resolution,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const graphRef = useRef();

  const { pieData, xlsxData } = useVisitorsLanguageData(formatMessage, {
    startAtMoment,
    endAtMoment,
    projectId: projectFilter,
  });
  const title = formatMessage(messages.title);

  if (hasNoData(pieData)) {
    return (
      <GraphCard title={title}>
        <EmptyPieChart />
      </GraphCard>
    );
  }

  const legend = pieData.map(
    (row): LegendItem => ({
      icon: 'circle',
      color: row.color,
      label: row.name,
    })
  );

  const startAt = startAtMoment?.toISOString();
  const endAt = endAtMoment?.toISOString();

  return (
    <GraphCard
      title={title}
      exportMenu={{
        name: title,
        svgNode: graphRef,
        xlsxData: isNilOrError(xlsxData) ? undefined : xlsxData,
        startAt,
        endAt,
        currentProjectFilter: projectFilter,
        resolution,
      }}
      fullWidth={false}
    >
      <Box height="initial" p="20px">
        <PieChart
          height={164}
          width={164}
          data={pieData}
          mapping={{
            angle: 'value',
            name: 'name',
          }}
          tooltip={renderTooltip(title)}
          legend={{
            items: legend,
            maintainGraphSize: true,
            marginLeft: 50,
            position: 'right-center',
          }}
          innerRef={graphRef}
        />
      </Box>
    </GraphCard>
  );
};

export default injectIntl(VisitorsCard);
