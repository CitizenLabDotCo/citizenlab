import React, { Suspense } from 'react';

import { Spinner } from '@citizenlab/cl2-component-library';

import modalRegistry, { ModalId } from './modals/modalRegistry';

const ModalRenderer = ({ modalId }: { modalId: ModalId | null }) => {
  if (!modalId) return null;

  const ModalComponent = modalRegistry[modalId].component;

  if (modalId === 'authentication') {
    return null; // Authentication modal is handled separately
  }

  // Type guard, should not happen
  if (!ModalComponent) return null;

  return (
    // Suspense is needed because the modals are loaded lazily.
    // Removing the Suspense will cause an error if there are multiple
    // modals queued and the next one takes some time to load.
    <Suspense fallback={<Spinner />}>
      <ModalComponent />
    </Suspense>
  );
};

export default ModalRenderer;
