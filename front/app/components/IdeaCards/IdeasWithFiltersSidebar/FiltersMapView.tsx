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
      <TopBar onReset={onClearFilters} onClose={onClose} />

      <Box height="100%" overflowY="auto" bgColor={colors.background}>
        <Box p="16px">
          <InputFilters
            selectedIdeaFilters={selectedIdeaFilters}
            onClearFilters={onClearFilters}
            hideResetButton
            hideStatusFilter
            {...filtersProps}
          />
        </Box>
      </Box>

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
    </>
  );
};

export default FiltersMapView;
