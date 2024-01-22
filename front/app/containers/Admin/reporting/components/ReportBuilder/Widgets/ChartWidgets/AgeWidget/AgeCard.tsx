import React from 'react';

// hooks
import useGraphDataUnits from 'api/graph_data_units/useGraphDataUnits';

// components
import { Box } from '@citizenlab/cl2-component-library';
import NoData from '../../_shared/NoData';
import BarChart from 'components/admin/Graphs/BarChart';

// i18n
import messages from '../messages';
import { useIntl } from 'utils/cl-intl';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { serieHasValues } from '../utils';
import convertToGraphFormat from 'containers/Admin/dashboard/users/Charts/AgeChart/convertToGraphFormat';

// types
import { ProjectId, Dates } from 'components/admin/GraphCards/typings';
import { IUsersByBirthyear } from 'api/users_by_birthyear/types';

type Props = ProjectId & Dates;

const AgeCard = ({ startAtMoment, endAtMoment, projectId }: Props) => {
  const IUsersByBirthyear = useGraphDataUnits<IUsersByBirthyear>({
    resolvedName: 'AgeWidget',
    props: {
      startAtMoment,
      endAtMoment,
      projectId,
    },
  });
  const { formatMessage } = useIntl();

  const ageSerie = convertToGraphFormat(IUsersByBirthyear, formatMessage);

  if (isNilOrError(ageSerie) || !serieHasValues(ageSerie)) {
    return <NoData message={messages.noData} />;
  }

  return (
    <Box width="100%" height="220px" mt="20px" pb="10px">
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
  );
};

export default AgeCard;
