import React, { useRef, useState } from 'react';

// hooks
import useVisitorsTrafficSourcesData from '../../hooks/useVisitorsTrafficSourcesData';

// components
import GraphCard from 'components/admin/GraphCard';
import PieChart from 'components/admin/Graphs/PieChart';
import { Box } from '@citizenlab/cl2-component-library';
import EmptyPieChart from '../EmptyPieChart';
import renderTooltip from './renderTooltip';

// i18n
import messages from './messages';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// typings
import { IResolution } from 'components/admin/ResolutionControl';
import { Moment } from 'moment';
import { isNilOrError } from 'utils/helperUtils';
import { LegendItem } from 'components/admin/Graphs/_components/Legend/typings';

interface Props {
  startAtMoment: Moment | null | undefined;
  endAtMoment: Moment | null;
  projectFilter: string | undefined;
  resolution: IResolution;
}

const VisitorsTrafficSourcesCard = ({
  startAtMoment,
  endAtMoment,
  projectFilter,
  resolution,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const graphRef = useRef();
  const { pieData, xlsxData } = useVisitorsTrafficSourcesData(formatMessage, {
    startAtMoment,
    endAtMoment,
    projectId: projectFilter,
  });
  const [hoverIndex, setHoverIndex] = useState<number | undefined>();

  const onMouseOver = ({ rowIndex }) => {
    setHoverIndex(rowIndex);
  };

  const onMouseOut = () => {
    setHoverIndex(undefined);
  };

  const cardTitle = formatMessage(messages.visitorsTrafficSources);

  if (isNilOrError(pieData)) {
    return (
      <GraphCard title={cardTitle}>
        <EmptyPieChart />
      </GraphCard>
    );
  }

  const legend = pieData.map(
    (row): LegendItem => ({
      icon: 'circle',
      color: row.color,
      label: `${row.name} (${row.percentage}%)`,
    })
  );

  const startAt = startAtMoment?.toISOString();
  const endAt = endAtMoment?.toISOString();

  return (
    <GraphCard
      title={cardTitle}
      exportMenu={{
        name: cardTitle,
        svgNode: graphRef,
        xlsxData: isNilOrError(xlsxData) ? undefined : xlsxData,
        startAt,
        endAt,
        currentProjectFilter: projectFilter,
        resolution,
      }}
      viewToggle={{
        view: 'chart',
        onChangeView: () => {},
      }}
    >
      <Box width="100%" height="initial" display="flex" alignItems="center">
        <PieChart
          width={164}
          height={164}
          data={pieData}
          mapping={{
            angle: 'value',
            name: 'name',
            opacity: ({ rowIndex }) => {
              if (hoverIndex === undefined) return 1;
              return hoverIndex === rowIndex ? 1 : 0.3;
            },
          }}
          tooltip={renderTooltip()}
          legend={{
            items: legend,
            marginLeft: 50,
            maintainGraphSize: true,
            position: 'right-center',
          }}
          innerRef={graphRef}
          onMouseOver={onMouseOver}
          onMouseOut={onMouseOut}
        />
      </Box>
    </GraphCard>
  );
};

export default injectIntl(VisitorsTrafficSourcesCard);
