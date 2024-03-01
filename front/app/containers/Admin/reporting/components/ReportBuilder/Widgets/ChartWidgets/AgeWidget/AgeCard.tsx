import React from 'react';

// hooks
import useLayout from 'containers/Admin/reporting/hooks/useLayout';
import { useUsersByAge } from 'api/graph_data_units';

// components
import { Box } from '@citizenlab/cl2-component-library';
import NoData from '../../_shared/NoData';
import BarChart from 'components/admin/Graphs/BarChart';

// i18n
import messages from '../messages';
import { useIntl } from 'utils/cl-intl';

// utils
import { serieHasValues, formatLargeNumber } from '../utils';
import convertToGraphFormat from 'containers/Admin/dashboard/users/Charts/AgeChart/convertToGraphFormat';

// typings
import { ProjectId, Dates, Layout } from 'components/admin/GraphCards/typings';
import { Margin } from 'components/admin/Graphs/typings';

const MARGINS: Record<Layout, Margin | undefined> = {
  wide: {
    left: -20,
    right: 0,
  },
  narrow: {
    right: -20,
  },
};

type Props = ProjectId & Dates;

const AgeCard = ({ startAtMoment, endAtMoment, projectId }: Props) => {
  const usersByBirthyear = useUsersByAge({
    startAtMoment,
    endAtMoment,
    projectId,
  });
  const { formatMessage } = useIntl();

  const ageSerie = convertToGraphFormat(usersByBirthyear, formatMessage);

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
