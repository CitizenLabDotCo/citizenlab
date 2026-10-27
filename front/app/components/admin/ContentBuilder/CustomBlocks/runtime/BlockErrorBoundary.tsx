import React, { ReactNode } from 'react';

import { ErrorBoundary } from '@sentry/react';

interface Props {
  /** Identifies the failing code in Sentry. A stack trace alone cannot. */
  blockId: string;
  version?: number;
  /** What to show instead. The citizen side passes nothing and renders a hole. */
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Contains a custom block's failures so one piece of generated code cannot take
 * the report down with it.
 *
 * To retry, give the element a `key` that changes — the host widget keys it on the
 * block, the version and the config. Nothing resets it from the inside: a boundary
 * that re-arms while its children still throw spins and locks the main thread.
 */
const BlockErrorBoundary = ({
  blockId,
  version,
  fallback,
  children,
}: Props) => (
  <ErrorBoundary
    fallback={<>{fallback}</>}
    beforeCapture={(scope, _error, componentStack) => {
      scope.setExtra('from', 'CustomBlock');
      scope.setExtra('customBlockId', blockId);
      scope.setExtra('customBlockVersion', version ?? 'draft');
      scope.setExtra('componentStack', componentStack);
    }}
  >
    {children}
  </ErrorBoundary>
);

export default BlockErrorBoundary;
