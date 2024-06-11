import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { useUsersByAge } from 'api/graph_data_units';

import convertToGraphFormat from 'containers/Admin/dashboard/users/Charts/AgeChart/convertToGraphFormat';
import useLayout from 'containers/Admin/reporting/hooks/useLayout';

import {
  ProjectId,
  DatesStrings,
  Layout,
} from 'components/admin/GraphCards/typings';
import BarChart from 'components/admin/Graphs/BarChart';
import { Margin } from 'components/admin/Graphs/typings';

import { useIntl } from 'utils/cl-intl';

import NoData from '../../../_shared/NoData';
import messages from '../../messages';
import { serieHasValues, formatLargeNumber } from '../../utils';

const MARGINS: Record<Layout, Margin | undefined> = {
  wide: {
    left: -20,
    right: 0,
  },
  narrow: {
    right: -20,
  },
};

type Props = ProjectId & DatesStrings;

const AgeCard = ({ startAt, endAt, projectId }: Props) => {
  const { data: usersByAge } = useUsersByAge({
    project_id: projectId,
    start_at: startAt,
    end_at: endAt,
  });
  const { formatMessage } = useIntl();

  const ageSerie = convertToGraphFormat(usersByAge, formatMessage);

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
