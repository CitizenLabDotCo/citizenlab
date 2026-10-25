import type { IPhaseData, IUpdatedPhaseProperties } from 'api/phases/types';
import type { IProjectData } from 'api/projects/types';

export const PREVIEW_FRAME_NAME = 'govocal-phase-preview';
export type PreviewLifecycle = 'before' | 'open' | 'ended';

export interface PreviewSnapshot {
  project: IProjectData;
  phase: IPhaseData;
  draft: IUpdatedPhaseProperties;
  unsaved?: boolean;
  lifecycle?: PreviewLifecycle;
}

export type Json = null | boolean | number | string | Json[] | JsonObject;
export interface JsonObject {
  [key: string]: Json | undefined;
}

export const object = (value: Json | undefined): JsonObject =>
  value && typeof value === 'object' && !Array.isArray(value) ? value : {};

export const relation = (id: string, type: string) => ({ data: { id, type } });

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const isPreviewSnapshot = (value: unknown): value is PreviewSnapshot =>
  isRecord(value) &&
  isRecord(value.project) &&
  typeof value.project.id === 'string' &&
  isRecord(value.project.attributes) &&
  isRecord(value.draft) &&
  (value.unsaved === undefined || typeof value.unsaved === 'boolean') &&
  (value.lifecycle === undefined ||
    value.lifecycle === 'before' ||
    value.lifecycle === 'open' ||
    value.lifecycle === 'ended') &&
  isRecord(value.phase) &&
  typeof value.phase.id === 'string' &&
  isRecord(value.phase.attributes);
