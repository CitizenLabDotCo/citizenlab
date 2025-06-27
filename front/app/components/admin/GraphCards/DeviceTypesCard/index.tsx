import React, { useRef, useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import GraphCard from 'components/admin/GraphCard';
import EmptyPieChart from 'components/admin/GraphCards/EmptyPieChart';
import { ProjectId, Dates } from 'components/admin/GraphCards/typings';
import { LegendItem } from 'components/admin/Graphs/_components/Legend/typings';
import PieChart from 'components/admin/Graphs/PieChart';

import { useIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import messages from './messages';
import renderTooltip from './renderTooltip';
import { getTranslations } from './translations';
import useDeviceTypes from './useDeviceTypes';

type Props = ProjectId & Dates;

const DeviceTypesCard = ({ projectId, startAtMoment, endAtMoment }: Props) => {
  const { formatMessage } = useIntl();
  const graphRef = useRef();

  const { pieData, xlsxData } = useDeviceTypes({
    projectId,
    startAtMoment,
    endAtMoment,
  });

  const [hoverIndex, setHoverIndex] = useState<number | undefined>();

  const onMouseOver = ({ rowIndex }) => {
    setHoverIndex(rowIndex);
  };

  const onMouseOut = () => {
    setHoverIndex(undefined);
  };

  const cardTitle = formatMessage(messages.title);
  const translations = getTranslations(formatMessage);

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
      label: `${translations[row.name]} (${row.percentage}%)`,
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
        currentProjectFilter: projectId,
      }}
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

export default DeviceTypesCard;
