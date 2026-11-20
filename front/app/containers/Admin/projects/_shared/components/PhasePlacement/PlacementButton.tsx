import React, { ReactNode } from 'react';

import { Spinner } from '@citizenlab/cl2-component-library';

import styles from './PlacementButton.module.css';

interface Props {
  appearance: 'primary' | 'secondary';
  disabled?: boolean;
  processing?: boolean;
  onClick: () => void;
  children: ReactNode;
  'data-cy'?: string;
}

// The old flow keeps the button look it has today; the redesign uses design-system buttons.
const PlacementButton = ({
  appearance,
  disabled = false,
  processing = false,
  onClick,
  children,
  'data-cy': dataCy,
}: Props) => {
  const className = [
    styles.button,
    styles[appearance],
    processing ? styles.processing : undefined,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={className}
      aria-disabled={disabled || processing}
      data-cy={dataCy}
      onClick={() => {
        if (!disabled && !processing) onClick();
      }}
    >
      <span className={styles.text}>{children}</span>
      {processing && (
        <span className={styles.spinner}>
          <Spinner
            size="24px"
            color={appearance === 'primary' ? '#ffffff' : '#1e1e1e'}
          />
        </span>
      )}
    </button>
  );
};

export default PlacementButton;
