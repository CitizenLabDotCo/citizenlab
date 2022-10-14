import React, { useState } from 'react';

// hooks
import useVisitorReferrers from '../../hooks/useVisitorReferrers';

// components
import { Box } from '@citizenlab/cl2-component-library';

// typings
import { QueryParametersWithoutPagination } from '../../hooks/useVisitorReferrers/typings';

const Table = ({
  projectId,
  startAtMoment,
  endAtMoment,
}: QueryParametersWithoutPagination) => {
  const [pageNumber /*, setPageNumber*/] = useState<number>(1);

  const { tableData } = useVisitorReferrers({
    projectId,
    startAtMoment,
    endAtMoment,
    pageSize: 10,
    pageNumber,
  });

  console.log(tableData);

  return <Box>Test</Box>;
};

export default Table;
