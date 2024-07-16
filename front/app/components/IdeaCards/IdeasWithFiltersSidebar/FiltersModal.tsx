import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import { isNumber } from 'lodash-es';

import useIdeasFilterCounts from 'api/ideas_filter_counts/useIdeasFilterCounts';

import BottomBar from 'components/FiltersModal/BottomBar';
import TopBar from 'components/FiltersModal/TopBar';
import FullscreenModal from 'components/UI/FullscreenModal';

import { FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import messages from '../messages';

import FiltersSideBar, { Props as FiltersSideBarProps } from './FiltersSideBar';

interface Props extends FiltersSideBarProps {
  opened: boolean;
  onClose: () => void;
}

const FiltersModal = ({
  opened,
  selectedIdeaFilters,
  onClearFilters,
  onClose,
  ...filtersSideBarProps
}: Props) => {
  const { data: ideasFilterCounts } = useIdeasFilterCounts(selectedIdeaFilters);
  const total = isNilOrError(ideasFilterCounts)
    ? null
    : ideasFilterCounts.data.attributes.total;

  return (
    <FullscreenModal
      opened={opened}
      close={onClose}
      animateInOut={true}
      topBar={<TopBar onReset={onClearFilters} onClose={onClose} />}
      bottomBar={
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
      }
    >
      <Box background={colors.background} padding="15px">
        <FiltersSideBar
          selectedIdeaFilters={selectedIdeaFilters}
          onClearFilters={onClearFilters}
          {...filtersSideBarProps}
        />
      </Box>
    </FullscreenModal>
  );
};

export default FiltersModal;
