import React from 'react';

// hooks
import useAgeSerie from 'containers/Admin/dashboard/users/Charts/AgeChart/useAgeSerie';

// components
import { Box, Title } from '@citizenlab/cl2-component-library';
import BarChart from 'components/admin/Graphs/BarChart';
import NoChartData from '../NoChartData';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { serieHasValues } from '../utils';

interface Props {
  startAt: string | null | undefined;
  endAt: string | null;
  projectId: string | undefined;
  title: string;
}

const AgeCard = ({ startAt, endAt, projectId, title }: Props) => {
  const ageSerie = useAgeSerie({
    startAt,
    endAt,
    projectId,
  });

  if (isNilOrError(ageSerie) || !serieHasValues(ageSerie)) {
    return <NoChartData title={title} />;
  }

  return (
    <Box width="100%" height="260px" pb="20px">
      <Title variant="h3" color="primary" m="16px">
        {title}
      </Title>
      <Box height="200px">
        <BarChart
          data={ageSerie}
          margin={{
            left: -20,
            right: 20,
          }}
          mapping={{
            category: 'name',
            length: 'value',
          }}
          labels
          tooltip
        />
      </Box>
    </Box>
  );
};

export default AgeCard;
