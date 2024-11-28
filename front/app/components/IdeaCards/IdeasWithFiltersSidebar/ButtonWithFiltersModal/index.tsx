import React, { useState } from 'react';

import { Box, Button, useBreakpoint } from '@citizenlab/cl2-component-library';
import { isNumber } from 'lodash-es';

import useIdeasFilterCounts from 'api/ideas_filter_counts/useIdeasFilterCounts';

import FullscreenModal from 'components/UI/FullscreenModal';

import { FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import InputFilters, { Props as InputFiltersProps } from '../InputFilters';

import BottomBar from './BottomBar';
import messages from './messages';
import TopBar from './TopBar';

const ButtonWithFiltersModal = ({
  selectedIdeaFilters,
  onClearFilters,
  ...filtersProps
}: InputFiltersProps) => {
  const isSmallerThanTablet = useBreakpoint('tablet');
  const [filtersModalOpened, setFiltersModalOpened] = useState(false);

  const { data: ideasFilterCounts } = useIdeasFilterCounts(selectedIdeaFilters);
  const total = isNilOrError(ideasFilterCounts)
    ? null
    : ideasFilterCounts.data.attributes.total;

  const openModal = () => {
    setFiltersModalOpened(true);
  };

  const closeModal = () => {
    setFiltersModalOpened(false);
  };

  if (!isSmallerThanTablet) return null;

  return (
    <>
      <Button
        buttonStyle="secondary-outlined"
        onClick={openModal}
        icon="filter"
        text={<FormattedMessage {...messages.filters} />}
        mb="12px"
        mt="4px"
      />
      <FullscreenModal
        opened={filtersModalOpened}
        close={closeModal}
        topBar={<TopBar onReset={onClearFilters} onClose={closeModal} />}
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
            onClick={closeModal}
          />
        }
        contentBgColor="background"
      >
        <Box p="16px">
          <InputFilters
            selectedIdeaFilters={selectedIdeaFilters}
            onClearFilters={onClearFilters}
            // We have a reset filters button in TopBar
            showResetButton={false}
            {...filtersProps}
          />
        </Box>
      </FullscreenModal>
    </>
  );
};

export default ButtonWithFiltersModal;
