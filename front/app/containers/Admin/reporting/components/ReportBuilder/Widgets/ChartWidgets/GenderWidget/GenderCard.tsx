import React from 'react';

// hooks
import useLayout from 'containers/Admin/reporting/hooks/useLayout';

// components
import { Box } from '@citizenlab/cl2-component-library';
import Chart from 'containers/Admin/dashboard/users/Charts/GenderChart/Chart';
import NoData from '../../_shared/NoData';

// i18n
import messages from '../messages';
import { useIntl } from 'utils/cl-intl';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { serieHasValues } from '../utils';
import useGraphDataUnits from 'api/graph_data_units/useGraphDataUnits';
import { IUsersByGender } from 'api/users_by_gender/types';
import convertToGraphFormat from 'containers/Admin/dashboard/users/Charts/GenderChart/convertToGraphFormat';

// types
import { ProjectId, Dates } from 'components/admin/GraphCards/typings';

type Props = ProjectId & Dates;

const GenderCard = ({ startAtMoment, endAtMoment, projectId }: Props) => {
  const usersByGender = useGraphDataUnits<IUsersByGender>({
    resolvedName: 'GenderWidget',
    queryParameters: {
      startAtMoment,
      endAtMoment,
      projectId,
    },
  });
  const { formatMessage } = useIntl();

  const genderSerie = convertToGraphFormat(usersByGender, formatMessage);

  const layout = useLayout();

  if (isNilOrError(genderSerie) || !serieHasValues(genderSerie)) {
    return <NoData message={messages.noData} />;
  }

  return (
    <Box width="100%" height="220px" mt="20px" pb="8px">
      <Chart data={genderSerie} layout={layout} />
    </Box>
  );
};

export default GenderCard;
