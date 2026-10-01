import { BlockMessages, BlockManifest } from 'api/custom_blocks/types';

export interface DraftBlock {
  /** Compiled ESM, straight from the build — not yet saved as a version. */
  bundle: string;
  manifest: BlockManifest;
  messages: BlockMessages;
}

/**
 * The one block id that means "the draft being checked, not a stored version".
 *
 * Nothing persists this: it exists so the check service can mount a block that has
 * no version row yet, in the same host widget and the same runtime a reader gets.
 * A report layout never contains it.
 */
export const DRAFT_BLOCK_ID = 'draft';

let draft: DraftBlock | null = null;

export const setDraftBlock = (block: DraftBlock | null) => {
  draft = block;
};

export const getDraftBlock = (): DraftBlock | null => draft;

export const isDraft = (blockId?: string): boolean =>
  blockId === DRAFT_BLOCK_ID;
