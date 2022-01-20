import React from 'react';

// hooks
import useAdminPublicationsStatusCount from 'hooks/useAdminPublicationsStatusCounts';

// components
import ProjectAndFolderCards, { BaseProps } from './ProjectAndFolderCards';

// utils
import { isNilOrError } from 'utils/helperUtils';

export default ({ publicationStatusFilter, ...otherProps }: BaseProps) => {
  const { counts, onChangeAreas } = useAdminPublicationsStatusCount({
    publicationStatusFilter,
    rootLevelOnly: true,
    removeNotAllowedParents: true,
  });

  if (isNilOrError(counts)) return null;

  return (
    <ProjectAndFolderCards
      publicationStatusFilter={publicationStatusFilter}
      onChangeAreas={onChangeAreas}
      {...otherProps}
    />
  );
};
