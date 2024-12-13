import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import FullscreenModal from 'components/UI/FullscreenModal';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../../../messages';
import InputFilters, { InputFiltersProps } from '../../InputFilters';

import BottomBar from './BottomBar';

interface Props extends InputFiltersProps {
  opened: boolean;
  onClose: () => void;
}

const FiltersModal = ({
  opened,
  ideaQueryParameters,
  onClearFilters,
  onClose,
  ...filtersProps
}: Props) => {
  return (
    <FullscreenModal
      opened={opened}
      close={onClose}
      modalTitle={<FormattedMessage {...messages.filters} />}
      bottomBar={
        <BottomBar
          onClick={onClose}
          ideaQueryParameters={ideaQueryParameters}
          onReset={onClearFilters}
          filtersActive={filtersProps.filtersActive}
        />
      }
      contentBgColor="background"
    >
      <Box p="16px">
        <InputFilters
          ideaQueryParameters={ideaQueryParameters}
          onClearFilters={onClearFilters}
          // We have a reset filters button in TopBar
          showResetButton={false}
          {...filtersProps}
        />
      </Box>
    </FullscreenModal>
  );
};

export default FiltersModal;
