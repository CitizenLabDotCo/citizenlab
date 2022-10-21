import React, { useRef, useState } from 'react';

// hooks
import useVisitorsLanguageData from '../../hooks/useVisitorsLanguageData';

// components
import { Box } from '@citizenlab/cl2-component-library';
import GraphCard from 'components/admin/GraphCard';
import PieChart from 'components/admin/Graphs/PieChart';
import EmptyPieChart from '../EmptyPieChart';
import renderTooltip from '../VisitorsTypeCard/renderTooltip';

// i18n
import { WrappedComponentProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from './messages';

// utils
import { isNilOrError } from 'utils/helperUtils';

// typings
import { LegendItem } from 'components/admin/Graphs/_components/Legend/typings';
import { IResolution } from 'components/admin/ResolutionControl';
import { Moment } from 'moment';

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
}: Props & WrappedComponentProps) => {
  const graphRef = useRef();

  const { pieData, xlsxData } = useVisitorsLanguageData(formatMessage, {
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

export default injectIntl(VisitorsCard);
