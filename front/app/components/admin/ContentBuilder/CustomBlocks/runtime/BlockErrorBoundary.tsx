import React, { Component, ReactNode } from 'react';

import { withScope } from '@sentry/react';

import { reportError } from 'utils/loggingUtils';

interface Props {
  /** Identifies the failing code in Sentry. A stack trace alone cannot. */
  blockId: string;
  version: number;
  /** What to show instead. The citizen side passes nothing and renders a hole. */
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Contains a custom block's own failures.
 *
 * A block is generated code running inside a report. When it throws, the report
 * around it has to stay readable and the other blocks have to keep rendering, so
 * the failure stops here.
 *
 * To retry, give the element a `key` that changes — the host widget keys it on
 * the block, the version and the config. Nothing resets it from the inside: a
 * boundary that re-arms itself while its children still throw spins in a
 * throw/catch/reset cycle and locks the main thread.
 */
class BlockErrorBoundary extends Component<Props, { hasError: boolean }> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    const { blockId, version } = this.props;

    withScope((scope) => {
      scope.setExtra('from', 'CustomBlock');
      scope.setExtra('customBlockId', blockId);
      scope.setExtra('customBlockVersion', version);
      scope.setExtra('componentStack', info.componentStack ?? null);
      reportError(error);
    });
  }

  render() {
    if (this.state.hasError) return this.props.fallback ?? null;

    return this.props.children;
  }
}

export default BlockErrorBoundary;
