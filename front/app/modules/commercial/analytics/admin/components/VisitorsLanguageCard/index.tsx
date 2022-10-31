import React, { useRef, useState } from 'react';

// hooks
import useVisitorLanguages from '../../hooks/useVisitorLanguages';

// components
import GraphCard from 'components/admin/GraphCard';
import PieChart from 'components/admin/Graphs/PieChart';
import { Box } from '@citizenlab/cl2-component-library';
import EmptyPieChart from '../EmptyPieChart';
import renderTooltip from '../VisitorsTypeCard/renderTooltip';

// i18n
import messages from './messages';
import { useIntl } from 'utils/cl-intl';

// utils
import { isNilOrError } from 'utils/helperUtils';

// typings
import { IResolution } from 'components/admin/ResolutionControl';
import { Moment } from 'moment';
import { LegendItem } from 'components/admin/Graphs/_components/Legend/typings';

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
}: Props) => {
  const { formatMessage } = useIntl();
  const graphRef = useRef();

  const { pieData, xlsxData } = useVisitorLanguages({
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

  const cardTitle = formatMessage(messages.title);

  if (isNilOrError(pieData)) {
    return (
      <GraphCard title={cardTitle} fullWidth={false}>
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
      title={cardTitle}
      exportMenu={{
        name: cardTitle,
        svgNode: graphRef,
        xlsx: isNilOrError(xlsxData) ? undefined : { data: xlsxData },
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
            opacity: ({ rowIndex }) => {
              if (hoverIndex === undefined) return 1;
              return hoverIndex === rowIndex ? 1 : 0.3;
            },
          }}
          tooltip={renderTooltip()}
          legend={{
            items: legend,
            maintainGraphSize: true,
            marginLeft: 50,
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

export default VisitorsCard;
