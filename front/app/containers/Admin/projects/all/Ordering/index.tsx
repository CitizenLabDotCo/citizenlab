import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

import useAdminPublications from 'api/admin_publications/useAdminPublications';

import SortableProjectList from './SortableProjectList';

const Ordering = () => {
  const { data: adminPublications } = useAdminPublications({
    publicationStatusFilter: ['published', 'draft', 'archived'],
    rootLevelOnly: true,
  });

  const flatAdminPublications = adminPublications?.pages
    .map((page) => page.data)
    .flat();

  return (
    <Box bgColor={colors.white} px="24px">
      <SortableProjectList adminPublications={flatAdminPublications} />
    </Box>
  );
};

export default Ordering;
