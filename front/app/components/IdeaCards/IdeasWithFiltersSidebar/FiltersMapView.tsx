import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import { isNumber } from 'lodash-es';

import useIdeasFilterCounts from 'api/ideas_filter_counts/useIdeasFilterCounts';

import BottomBar from 'components/FiltersModal/BottomBar';
import TopBar from 'components/FiltersModal/TopBar';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';

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
  const { data: ideasFilterCounts } = useIdeasFilterCounts(selectedIdeaFilters);
  const total = ideasFilterCounts?.data.attributes.total || null;

  return (
    <>
      <Box display="flex" flexDirection="column" alignItems="stretch">
        <TopBar onReset={onClearFilters} onClose={onClose} />
      </Box>
      <Box height="100%" overflowY="auto" bgColor={colors.grey100}>
        <Box p="16px">
          <InputFilters
            selectedIdeaFilters={selectedIdeaFilters}
            onClearFilters={onClearFilters}
            showClearButton={false}
            hideStatusFilter={true}
            {...filtersProps}
          />
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" alignItems="stretch">
        <BottomBar
          buttonText={
            total && isNumber(total) ? (
              <FormattedMessage
                {...messages.showXResults}
                values={{
                  ideasCount: total,
                }}
              />
            ) : (
              <FormattedMessage {...messages.showResults} />
            )
          }
          onClick={onClose}
        />
      </Box>
    </>
  );
};

export default FiltersMapView;
