import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

import BottomBar from './ButtonWithFiltersModal/FiltersModal/BottomBar';
import TopBar from './ButtonWithFiltersModal/FiltersModal/TopBar';
import InputFilters, { Props as InputFiltersProps } from './InputFilters';

interface Props extends InputFiltersProps {
  opened: boolean;
  onClose: () => void;
}

const FiltersMapView = ({
  selectedIdeaFilters,
  onClearFilters,
  onClose,
  ...filtersProps
}: Props) => {
  return (
    <>
      <TopBar onReset={onClearFilters} onClose={onClose} />
      <Box height="100%" overflowY="auto" bgColor={colors.background}>
        <Box p="16px">
          <InputFilters
            selectedIdeaFilters={selectedIdeaFilters}
            onClearFilters={onClearFilters}
            // A reset button is available in the filters top bar
            showResetButton={false}
            // BE doesn't currently support filtering map markers by status.
            // Until this is fixed, we hide the status filter on the map view to reduce confusion.
            showStatusFilter={false}
            {...filtersProps}
          />
        </Box>
      </Box>
      <BottomBar onClick={onClose} selectedIdeaFilters={selectedIdeaFilters} />
    </>
  );
};

export default FiltersMapView;
