import React from 'react';

// hooks
import useVisitorReferrerTypes from 'components/admin/GraphCards/VisitorsTrafficSourcesCard/useVisitorReferrerTypes';
import useNarrow from 'containers/Admin/reporting/hooks/useNarrow';

// components
import { Box, Title } from '@citizenlab/cl2-component-library';
import PieChart from 'components/admin/Graphs/PieChart';

// utils
import { isNilOrError } from 'utils/helperUtils';

// typings
import {
  ProjectId,
  Dates,
  ChartDisplay,
} from 'components/admin/GraphCards/typings';
import { LegendItem } from 'components/admin/Graphs/_components/Legend/typings';

type Props = ProjectId & Dates & ChartDisplay;

const VisitorsTrafficSourcesCard = ({
  projectId,
  startAtMoment,
  endAtMoment,
  title,
}: Props) => {
  const { pieData } = useVisitorReferrerTypes({
    projectId,
    startAtMoment,
    endAtMoment,
  });
  const narrow = useNarrow();

  if (isNilOrError(pieData)) return null;

  const legend = pieData.map(
    (row): LegendItem => ({
      icon: 'circle',
      color: row.color,
      label: `${row.name} (${row.percentage}%)`,
    })
  );

  return (
    <Box width="100%" height="260px" pb="20px">
      <Title variant="h3" color="primary" m="16px">
        {title}
      </Title>
      <Box height="200px">
        <PieChart
          width={164}
          height={195}
          data={pieData}
          mapping={{
            angle: 'value',
            name: 'name',
          }}
          legend={{
            items: legend,
            marginLeft: narrow ? 10 : 50,
            maintainGraphSize: true,
            position: 'right-center',
          }}
        />
      </Box>
    </Box>
  );
};

export default VisitorsTrafficSourcesCard;
