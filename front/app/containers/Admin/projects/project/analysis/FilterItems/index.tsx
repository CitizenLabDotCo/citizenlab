import { Box, colors, stylingConsts } from '@citizenlab/cl2-component-library';
import { IInputsFilterParams } from 'api/analysis_inputs/types';
import React from 'react';

type FilterItemsProps = {
  filters: IInputsFilterParams;
};
const FilterItems = ({ filters }: FilterItemsProps) => {
  return (
    <div>
      {Object.entries(filters)
        .filter(([k]) => k !== 'tag_ids')
        .map(([k, v]) => (
          <Box
            key={k}
            bgColor={colors.teal200}
            color={colors.teal700}
            py="2px"
            px="4px"
            borderRadius={stylingConsts.borderRadius}
          >
            {k}: {v}
          </Box>
        ))}
    </div>
  );
};

export default FilterItems;
