import React, { useRef } from 'react';

// hooks
import useVisitorsTrafficSourcesData from '../../hooks/useVisitorsTrafficSourcesData';

// components
import GraphCard from 'components/admin/GraphCard';
import PieChart from 'components/admin/Graphs/PieChart';
import { Box } from '@citizenlab/cl2-component-library';

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

const VisitorsCard = ({
  startAtMoment,
  endAtMoment,
  projectFilter,
  resolution,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const graphRef = useRef();
  const { pieData } = useVisitorsTrafficSourcesData({
    startAtMoment,
    endAtMoment,
    projectId: projectFilter,
  });

  if (isNilOrError(pieData)) return null;

  const legend = pieData.map(
    (row): LegendItem => ({
      icon: 'circle',
      color: row.color,
      label: row.name,
    })
  );

  const cardTitle = formatMessage(messages.visitorsTrafficSources);
  const startAt = startAtMoment?.toISOString();
  const endAt = endAtMoment?.toISOString();

  return (
    <GraphCard
      title={cardTitle}
      exportMenu={{
        name: cardTitle,
        svgNode: graphRef,
        // xlsxData: isNilOrError(xlsxData) ? undefined : xlsxData,
        startAt,
        endAt,
        currentProjectFilter: projectFilter,
        resolution,
      }}
    >
      <Box width="100%" maxWidth="300px" height="initial">
        <PieChart
          height={140}
          data={pieData}
          mapping={{
            angle: 'value',
            name: 'name',
          }}
          legend={{
            items: legend,
            marginTop: 15,
            maintainGraphSize: true,
            position: 'right-center',
          }}
          innerRef={graphRef}
        />
      </Box>
    </GraphCard>
  );
};

export default injectIntl(VisitorsCard);
