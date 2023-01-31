import React from 'react';

// hooks
import useAgeSerie from 'containers/Admin/dashboard/users/Charts/AgeChart/useAgeSerie';

// components
import { Box } from '@citizenlab/cl2-component-library';
import NoData from '../../_shared/NoData';
import BarChart from 'components/admin/Graphs/BarChart';

// i18n
import messages from '../messages';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { serieHasValues } from '../utils';

interface Props {
  startAt: string | null | undefined;
  endAt: string | null;
  projectId: string | undefined;
}

const AgeCard = ({ startAt, endAt, projectId }: Props) => {
  const ageSerie = useAgeSerie({
    startAt,
    endAt,
    projectId,
  });

  if (isNilOrError(ageSerie) || !serieHasValues(ageSerie)) {
    return <NoData message={messages.noData} />;
  }

  return (
    <Box width="100%" height="220px" mt="20px" pb="10px">
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
