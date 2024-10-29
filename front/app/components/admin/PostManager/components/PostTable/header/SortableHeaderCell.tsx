import React from 'react';

import { Th, colors } from '@citizenlab/cl2-component-library';

import { Sort as IdeasSort } from 'api/ideas/types';

interface Props {
  sortAttribute?: IdeasSort;
  sortAttributeName: IdeasSort;
  sortDirection?: 'ascending' | 'descending' | null;
  infoTooltip?: React.ReactChild;
  onChange: () => void;
  children: React.ReactNode;
}

const SortableHeaderCell = ({
  sortAttribute,
  sortDirection,
  sortAttributeName,
  infoTooltip,
  onChange,
  children,
}: Props) => {
  return (
    <Th
      clickable
      sortDirection={
        sortAttribute &&
        sortDirection &&
        sortAttributeName === sortAttribute.replace(/^-/, '')
          ? sortDirection
          : undefined
      }
      background={
        sortAttribute === sortAttributeName ? colors.grey200 : undefined
      }
      infoTooltip={infoTooltip}
      onClick={onChange}
      style={{ whiteSpace: 'nowrap' }}
    >
      {children}
    </Th>
  );
};

export default SortableHeaderCell;
