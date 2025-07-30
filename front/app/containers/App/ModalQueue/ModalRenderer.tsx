import React, { Suspense } from 'react';

import { Spinner } from '@citizenlab/cl2-component-library';

import modalRegistry, { ModalId } from './modals/modalRegistry';

const ModalRenderer = ({ modalId }: { modalId: ModalId | null }) => {
  if (!modalId) return null;

  const ModalComponent = modalRegistry[modalId].component;

  return (
    // Suspense is needed because the modals are loaded lazily.
    // Removing the Suspense will cause an error if there are multiple
    // modals being rendered and the next one takes some time to load.
    <Suspense fallback={<Spinner />}>
      <ModalComponent />
    </Suspense>
  );
};

export default ModalRenderer;
