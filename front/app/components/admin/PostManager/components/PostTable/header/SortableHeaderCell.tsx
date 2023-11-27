import React from 'react';
import { Sort as IdeasSort } from 'api/ideas/types';

// components
import { Th, colors } from '@citizenlab/cl2-component-library';

interface Props {
  sortAttribute?: IdeasSort;
  sortAttributeName: IdeasSort;
  sortDirection?: 'ascending' | 'descending' | null;
  infoTooltip?: React.ReactChild;
  width: string;
  onChange: () => void;
  children: React.ReactNode;
}

const SortableHeaderCell = ({
  sortAttribute,
  sortDirection,
  sortAttributeName,
  width,
  infoTooltip,
  onChange,
  children,
}: Props) => {
  return (
    <Th
      clickable
      width={width}
      sortDirection={
        sortAttribute === sortAttributeName && sortDirection
          ? sortDirection
          : undefined
      }
      background={
        sortAttribute === sortAttributeName ? colors.grey200 : undefined
      }
      infoTooltip={infoTooltip}
      onClick={onChange}
    >
      {children}
    </Th>
  );
};

export default SortableHeaderCell;
