import { Multiloc } from 'typings';

import { Keys } from 'utils/cl-react-query/types';

import customBlocksKeys from './keys';

export type CustomBlocksKeys = Keys<typeof customBlocksKeys>;

export type CustomBlockStatus = 'draft' | 'published' | 'disabled';

// Reports are the only builder the block widget is registered in.
export type CustomBlockTarget = 'report';

// --- Manifest ---
// Written by the generation loop, completed by the build, validated on both sides.

// The config schema is a JSON Schema object: one property per field the builder
// sidebar offers. Two extensions carry what plain JSON Schema cannot express.
export type ConfigFieldType = 'string' | 'number' | 'integer' | 'boolean';

export interface ConfigFieldSchema {
  type: ConfigFieldType;
  title?: string;
  description?: string;
  default?: unknown;
  /** A fixed set of values, rendered as a dropdown. */
  enum?: string[];
  /**
   * Marks a string whose value is a multiloc, so the sidebar offers one input per
   * locale. Plain JSON Schema cannot express a translated string.
   */
  'x-multiloc'?: boolean;
  /** A record picker, rather than asking the admin to paste an id. */
  'x-picker'?: 'project';
}

export interface ConfigSchema {
  type: 'object';
  properties?: Record<string, ConfigFieldSchema>;
  required?: string[];
}

export interface BlockManifest {
  manifest_version: number;
  sdk_version: string;
  targets: CustomBlockTarget[];
  // The gv-sdk data hooks the block uses, so the blast radius of an SDK change
  // is a query rather than a code search.
  data_uses: string[];
  config_schema?: ConfigSchema;
  // The reporting queries the block runs, read out of its source at build time.
  queries?: string[];
}

// locale -> message key -> text
export type BlockMessages = Record<string, Record<string, string>>;

// Per-instance configuration values, stored in the craftjs node props.
export type BlockConfigValues = Record<string, unknown>;

// --- API resources ---

// One pinned version. The bundle is left out so it can be served and cached as
// JavaScript of its own; the authored source is of no use to a renderer.
export interface ICustomBlockVersionData {
  id: string;
  type: 'custom_block_version';
  attributes: {
    number: number;
    sdk_version: string;
    manifest: BlockManifest;
    messages: BlockMessages;
    created_at: string;
    block_title_multiloc: Multiloc;
    block_status: CustomBlockStatus;
  };
}

export interface ICustomBlockVersion {
  data: ICustomBlockVersionData;
}

// A block as the toolbox lists it: its name, and the version a new placement pins.
export interface ICustomBlockData {
  id: string;
  type: 'custom_block';
  attributes: {
    title_multiloc: Multiloc;
    status: CustomBlockStatus;
    created_at: string;
    // Null only for a block with no version yet, which cannot be published.
    latest_version: number | null;
    targets: CustomBlockTarget[];
  };
}

export interface ICustomBlocks {
  data: ICustomBlockData[];
}

export interface ICustomBlockVersionParams {
  blockId?: string;
  version?: number;
}

// Served with Content-Type: text/javascript and immutable cache headers; the
// block loader imports it directly, so this is not a fetcher path.
export const customBlockBundleUrl = (blockId: string, version: number) =>
  `/web_api/v1/custom_blocks/${blockId}/versions/${version}/bundle`;
