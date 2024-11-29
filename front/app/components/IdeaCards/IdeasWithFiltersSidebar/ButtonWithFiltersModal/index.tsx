import React, { lazy, useState, Suspense } from 'react';

import { Button, useBreakpoint } from '@citizenlab/cl2-component-library';

import { FormattedMessage } from 'utils/cl-intl';

import { Props as InputFiltersProps } from '../InputFilters';

const FiltersModal = lazy(() => import('./FiltersModal'));
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
      <Suspense fallback={null}>
        <FiltersModal
          opened={filtersModalOpened}
          selectedIdeaFilters={selectedIdeaFilters}
          onClearFilters={onClearFilters}
          onClose={closeModal}
          {...filtersProps}
        />
      </Suspense>
    </>
  );
};

export default ButtonWithFiltersModal;
