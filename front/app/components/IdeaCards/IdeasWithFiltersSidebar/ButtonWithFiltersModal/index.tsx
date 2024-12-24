import React, { lazy, useState, Suspense } from 'react';

import { Button, useBreakpoint } from '@citizenlab/cl2-component-library';

import { trackEventByName } from 'utils/analytics';
import { FormattedMessage } from 'utils/cl-intl';

import tracks from '../../tracks';
import { InputFiltersProps } from '../InputFilters';

import messages from './FiltersModal/messages';

const FiltersModal = lazy(() => import('./FiltersModal'));

const ButtonWithFiltersModal = ({
  ideaQueryParameters,
  ...filtersProps
}: InputFiltersProps) => {
  const isSmallerThanTablet = useBreakpoint('tablet');
  const [filtersModalOpened, setFiltersModalOpened] = useState(false);

  const openModal = () => {
    trackEventByName(tracks.openFiltersModalMobile);
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
          ideaQueryParameters={ideaQueryParameters}
          onClose={closeModal}
          {...filtersProps}
        />
      </Suspense>
    </>
  );
};

export default ButtonWithFiltersModal;
