import React, { lazy, Suspense } from 'react';

import styles from '../commentsPanel.module.css';

import type { PanelFormButtonsProps } from './PanelFormButtons';
import 'design-system/tokens.css';

// Loaded lazily so the design-system Button, and React Aria with it, stays out of
// the citizen-facing idea page bundle, which renders comment forms for everyone.
const PanelFormButtons = lazy(() => import('./PanelFormButtons'));

const LazyPanelFormButtons = ({
  cancelLabel,
  submitLabel,
  onCancel,
  onSubmit,
  processing,
  isCancelDisabled,
  isSubmitDisabled,
  submitId,
}: PanelFormButtonsProps) => (
  <Suspense fallback={<div className={styles.buttonsPlaceholder} />}>
    <PanelFormButtons
      cancelLabel={cancelLabel}
      submitLabel={submitLabel}
      onCancel={onCancel}
      onSubmit={onSubmit}
      processing={processing}
      isCancelDisabled={isCancelDisabled}
      isSubmitDisabled={isSubmitDisabled}
      submitId={submitId}
    />
  </Suspense>
);

export default LazyPanelFormButtons;
