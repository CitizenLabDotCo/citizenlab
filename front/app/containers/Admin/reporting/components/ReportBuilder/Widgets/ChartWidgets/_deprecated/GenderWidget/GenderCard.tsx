import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { useUsersByGender } from 'api/graph_data_units';

import convertToGraphFormat from 'containers/Admin/dashboard/users/Charts/GenderChart/convertToGraphFormat';
import useLayout from 'containers/Admin/reporting/hooks/useLayout';

import { ProjectId, DatesStrings } from 'components/admin/GraphCards/typings';

import { useIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import NoData from '../../../_shared/NoData';
import messages from '../../messages';
import { serieHasValues } from '../../utils';

import Chart from './Chart';

type Props = ProjectId & DatesStrings;

const GenderCard = ({ startAt, endAt, projectId }: Props) => {
  const { data: usersByGender } = useUsersByGender({
    project_id: projectId,
    start_at: startAt,
    end_at: endAt,
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
