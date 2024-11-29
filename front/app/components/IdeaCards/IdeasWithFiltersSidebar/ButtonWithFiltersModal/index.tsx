import React, { useState } from 'react';

import { Button, useBreakpoint } from '@citizenlab/cl2-component-library';

import { FormattedMessage } from 'utils/cl-intl';

import { Props as InputFiltersProps } from '../InputFilters';

import FiltersModal from './FiltersModal';
import messages from './FiltersModal/messages';

const ButtonWithFiltersModal = ({
  selectedIdeaFilters,
  onClearFilters,
  ...filtersProps
}: InputFiltersProps) => {
  const isSmallerThanTablet = useBreakpoint('tablet');
  const [filtersModalOpened, setFiltersModalOpened] = useState(false);

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
      <FiltersModal
        opened={filtersModalOpened}
        selectedIdeaFilters={selectedIdeaFilters}
        onClearFilters={onClearFilters}
        onClose={closeModal}
        {...filtersProps}
      />
    </>
  );
};

export default ButtonWithFiltersModal;
