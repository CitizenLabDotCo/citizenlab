import React from 'react';

// hooks
import useGenderSerie from 'containers/Admin/dashboard/users/Charts/GenderChart/useGenderSerie';
import useNarrow from 'containers/Admin/reporting/hooks/useNarrow';

// components
import { Box, Title } from '@citizenlab/cl2-component-library';
import Chart from 'containers/Admin/dashboard/users/Charts/GenderChart/Chart';

// utils
import { isNilOrError } from 'utils/helperUtils';

interface Props {
  startAt: string | null | undefined;
  endAt: string | null;
  projectId: string | undefined;
  title: string;
}

const GenderCard = ({ startAt, endAt, projectId, title }: Props) => {
  const genderSerie = useGenderSerie({
    startAt,
    endAt,
    projectId,
  });

  const narrow = useNarrow();

  if (isNilOrError(genderSerie)) return null;

  return (
    <Box width="100%" height="260px" pb="20px">
      <Title variant="h3" color="primary" m="16px">
        {title}
      </Title>
      <Box height="200px">
        <Chart data={genderSerie} narrow={narrow} />
      </Box>
    </Box>
  );
};

export default GenderCard;
