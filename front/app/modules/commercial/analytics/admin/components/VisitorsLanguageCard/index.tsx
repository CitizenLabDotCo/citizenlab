import React, { useRef, useState } from 'react';

// hooks
import useVisitorsLanguageData from '../../hooks/useVisitorsLanguageData';

// components
import GraphCard from 'components/admin/GraphCard';
import PieChart from 'components/admin/Graphs/PieChart';
import { Box } from '@citizenlab/cl2-component-library';
import EmptyPieChart from '../EmptyPieChart';
import renderTooltip from '../../utils/renderSimpleTooltip';

// i18n
import messages from './messages';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

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
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
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
      <GraphCard title={cardTitle}>
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
          tooltip={renderTooltip(cardTitle)}
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
