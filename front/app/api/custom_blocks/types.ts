import { Multiloc } from 'typings';

import { Keys } from 'utils/cl-react-query/types';

import customBlocksKeys from './keys';

export type CustomBlocksKeys = Keys<typeof customBlocksKeys>;

export type CustomBlockStatus = 'draft' | 'published' | 'disabled';

// The only supported target for now. Other builders (homepage, project
// description) get their own value once the host widget is registered there.
export type CustomBlockTarget = 'report';

// --- Manifest ---
// Written by the report generation loop, filled in by the build, stored per
// version and validated on both sides.

// The config schema is a JSON Schema object: one property per field the builder
// sidebar offers. Two extensions carry what plain JSON Schema cannot express.
export type ConfigFieldType = 'string' | 'number' | 'integer' | 'boolean';

export interface ConfigFieldSchema {
  type: ConfigFieldType;
  /** The label the admin reads. */
  title?: string;
  description?: string;
  default?: unknown;
  /** A fixed set of values, rendered as a dropdown. */
  enum?: string[];
  /**
   * A string whose value is a multiloc object, so the sidebar offers one input
   * per locale. Plain JSON Schema has no translated string, and a chart title
   * that exists in one language only is not shippable here.
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
  // Names of gv-sdk data hooks the block uses, e.g. ['useReportingData'].
  // Used for impact analysis when the SDK evolves.
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

// One pinned version, and the little the renderer needs to know about the block
// it belongs to. Neither the authored source nor the compiled bundle is in here:
// the bundle has its own endpoint so the browser can cache it, and the source is
// of no use to a renderer.
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
