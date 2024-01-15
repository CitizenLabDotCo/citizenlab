import React from 'react';

// hooks
import useAgeSerie from 'containers/Admin/dashboard/users/Charts/AgeChart/useAgeSerie';
import useLayout from 'containers/Admin/reporting/hooks/useLayout';

// components
import { Box } from '@citizenlab/cl2-component-library';
import NoData from '../../_shared/NoData';
import BarChart from 'components/admin/Graphs/BarChart';

// i18n
import messages from '../messages';

// utils
import { serieHasValues, formatLargeNumber } from '../utils';

// typings
import { Layout } from 'components/admin/GraphCards/typings';
import { Margin } from 'components/admin/Graphs/typings';

interface Props {
  startAt: string | null | undefined;
  endAt: string | null;
  projectId: string | undefined;
}

const MARGINS: Record<Layout, Margin | undefined> = {
  wide: {
    left: -20,
    right: 20,
  },
  narrow: {
    right: -20,
  },
};

const AgeCard = ({ startAt, endAt, projectId }: Props) => {
  const ageSerie = useAgeSerie({
    startAt,
    endAt,
    projectId,
  });

  const layout = useLayout();

  if (!ageSerie || !serieHasValues(ageSerie)) {
    return <NoData message={messages.noData} />;
  }

  return (
    <Box width="100%" height="220px" mt="20px" pb="10px">
      <BarChart
        data={ageSerie}
        margin={MARGINS[layout]}
        mapping={{
          category: 'name',
          length: 'value',
        }}
        yaxis={{
          orientation: 'right',
          tickFormatter: formatLargeNumber,
        }}
        labels
        tooltip
      />
    </Box>
  );
};

export default AgeCard;
