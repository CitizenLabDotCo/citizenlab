import React from 'react';

// hooks
import useGenderSerie from 'containers/Admin/dashboard/users/Charts/GenderChart/useGenderSerie';
import useNarrow from 'containers/Admin/reporting/hooks/useNarrow';

// components
import { Box } from '@citizenlab/cl2-component-library';
import Chart from 'containers/Admin/dashboard/users/Charts/GenderChart/Chart';
import NoData from '../../_shared/NoData';

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

const GenderCard = ({ startAt, endAt, projectId }: Props) => {
  const genderSerie = useGenderSerie({
    startAt,
    endAt,
    projectId,
  });

  const narrow = useNarrow();

  if (isNilOrError(genderSerie) || !serieHasValues(genderSerie)) {
    return <NoData message={messages.noData} />;
  }

  return (
    <Box width="100%" height="220px" mt="20px" pb="10px">
      <Box height="200px">
        <Chart data={genderSerie} narrow={narrow} />
      </Box>
    </Box>
  );
};

export default GenderCard;
