import { SerializedNode } from '@craftjs/core';

/**
 * The name a serialized node is registered under in the editor's resolver.
 * Use this to identify a widget, never `displayName`: that one is derived from
 * the component's function name, which minification rewrites, and it is
 * persisted as-is in stored layouts.
 */
export const getResolvedName = (node: SerializedNode): string | undefined =>
  typeof node.type === 'object' ? node.type.resolvedName : node.type;
