import { Multiloc } from 'typings';

import { Keys } from 'utils/cl-react-query/types';

import customBlocksKeys from './keys';

export type CustomBlocksKeys = Keys<typeof customBlocksKeys>;

export type CustomBlockStatus = 'draft' | 'published' | 'disabled';

// A version authored by the background composer starts 'pending': it carries source
// but no bundle until the browser compiles it on first open.
export type CustomBlockCompileState = 'pending' | 'compiled' | 'failed';

// The only supported target for now. Other builders (homepage, project
// description) get their own value once the host widget is registered there.
export type CustomBlockTarget = 'report';

// --- Manifest ---
// Authored by the AI loop, stored per version, validated on both sides.

interface BlockConfigFieldBase {
  key: string;
  label: Multiloc;
}

export interface TextConfigField extends BlockConfigFieldBase {
  type: 'text';
  default?: string;
}

export interface NumberConfigField extends BlockConfigFieldBase {
  type: 'number';
  default?: number;
}

export interface BooleanConfigField extends BlockConfigFieldBase {
  type: 'boolean';
  default?: boolean;
}

export interface MultilocTextConfigField extends BlockConfigFieldBase {
  type: 'multiloc_text';
  default?: Multiloc;
}

export interface SelectConfigField extends BlockConfigFieldBase {
  type: 'select';
  options: { value: string; label: Multiloc }[];
  default?: string;
}

export type BlockConfigField =
  | TextConfigField
  | NumberConfigField
  | BooleanConfigField
  | MultilocTextConfigField
  | SelectConfigField;

export interface BlockManifest {
  manifest_version: 1;
  sdk_version: 1;
  targets: CustomBlockTarget[];
  // Names of gv-sdk data hooks the block uses, e.g. ['useProjectsMini'].
  // Used for impact analysis when the SDK evolves.
  data_uses: string[];
  config_schema: BlockConfigField[];
}

// locale -> message key -> text
export type BlockMessages = Record<string, Record<string, string>>;

// Per-instance configuration values, stored in the craftjs node props.
export type BlockConfigValues = Record<string, unknown>;

// --- API resources ---

export interface ICustomBlockVersionSummary {
  id: string;
  number: number;
  manifest: BlockManifest;
  messages: BlockMessages;
  sdk_version: number;
  compile_state: CustomBlockCompileState;
  created_at: string;
}

export interface ICustomBlockData {
  id: string;
  type: 'custom_block';
  attributes: {
    title_multiloc: Multiloc;
    description_multiloc: Multiloc | null;
    status: CustomBlockStatus;
    created_at: string;
    updated_at: string;
    current_version: ICustomBlockVersionSummary | null;
  };
}

export interface ICustomBlock {
  data: ICustomBlockData;
}

export interface ICustomBlocks {
  data: ICustomBlockData[];
}

export interface ICustomBlocksParams {
  status?: CustomBlockStatus;
  // Set when listing the versions of one block rather than the blocks themselves.
  versionsOf?: string;
}

export interface IAddCustomBlock {
  title_multiloc: Multiloc;
}

export interface IUpdateCustomBlock {
  id: string;
  title_multiloc?: Multiloc;
  description_multiloc?: Multiloc;
  status?: CustomBlockStatus;
}

export interface ICustomBlockVersionData {
  id: string;
  type: 'custom_block_version';
  attributes: {
    number: number;
    source: string;
    manifest: BlockManifest;
    messages: BlockMessages;
    sdk_version: number;
    compile_state: CustomBlockCompileState;
    created_at: string;
  };
}

export interface ICustomBlockVersion {
  data: ICustomBlockVersionData;
}

export interface ICustomBlockVersions {
  data: ICustomBlockVersionData[];
}

export interface IAddCustomBlockVersion {
  customBlockId: string;
  source: string;
  bundle: string;
  compile_state: CustomBlockCompileState;
  manifest: BlockManifest;
  messages: BlockMessages;
  ai_session_id?: string;
}

// Served with Content-Type: text/javascript; imported at runtime by the
// custom block loader. Not a fetcher path: the browser imports it directly.
export const customBlockBundleUrl = (blockId: string, version: number) =>
  `/web_api/v1/custom_blocks/${blockId}/versions/${version}/bundle`;
