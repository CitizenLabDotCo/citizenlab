import React, { Component, ComponentType, ReactNode } from 'react';

import { BlockMessages } from 'api/custom_blocks/types';

import { BlockProps } from './types';

interface BoundaryProps {
  onError?: (error: Error, componentStack: string | null) => void;
  fallback?: ReactNode;
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
    // A new block component or config gets a fresh chance to render.
    if (prevProps.children !== this.props.children && this.state.hasError) {
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
}

const CustomBlockRenderer = ({
  component: BlockComponent,
  config,
  msg,
  onError,
  fallback,
}: Props) => (
  <BlockErrorBoundary onError={onError} fallback={fallback}>
    <BlockComponent config={config} msg={msg} />
  </BlockErrorBoundary>
);

export default CustomBlockRenderer;
