import React, { Component, ComponentType, ReactNode } from 'react';

import { BlockMessages } from 'api/custom_blocks/types';

import { BlockProps } from './types';

interface BoundaryProps {
  onError?: (error: Error, componentStack: string | null) => void;
  fallback?: ReactNode;
  // A latched boundary retries the children only when this value changes
  // (identity comparison). Callers pass a value derived from the block
  // identity and config, NOT from the children: a children-identity reset
  // re-arms the boundary on every parent render, and since onError updates
  // parent state, a block that throws on each render then locks the main
  // thread in a throw/catch/reset cycle.
  resetKey?: unknown;
  children: ReactNode;
}

export class BlockErrorBoundary extends Component<
  BoundaryProps,
  { hasError: boolean }
> {
  constructor(props: BoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.props.onError?.(error, info.componentStack ?? null);
  }

  componentDidUpdate(prevProps: BoundaryProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) return this.props.fallback ?? null;
    return this.props.children;
  }
}

// Builds the msg() lookup for a locale with fallback to any locale that has
// the key, so a missing translation never renders a hole.
export const buildMessageLookup = (
  messages: BlockMessages | undefined,
  locale: string
): ((key: string) => string) => {
  return (key: string) => {
    const forLocale = messages?.[locale]?.[key];
    if (forLocale !== undefined) return forLocale;

    for (const catalog of Object.values(messages ?? {})) {
      const fallback = (catalog as Record<string, string | undefined>)[key];
      if (fallback !== undefined) return fallback;
    }
    return key;
  };
};

interface Props extends BlockProps {
  component: ComponentType<BlockProps>;
  onError?: (error: Error, componentStack: string | null) => void;
  fallback?: ReactNode;
  resetKey?: unknown;
}

const CustomBlockRenderer = ({
  component: BlockComponent,
  config,
  msg,
  onError,
  fallback,
  resetKey,
}: Props) => (
  <BlockErrorBoundary onError={onError} fallback={fallback} resetKey={resetKey}>
    <BlockComponent config={config} msg={msg} />
  </BlockErrorBoundary>
);

export default CustomBlockRenderer;
