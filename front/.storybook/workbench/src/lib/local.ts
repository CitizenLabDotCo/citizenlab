// The local write API (npm run ds:local, /__ds/ on the same origin). On a
// hosted workbench there is none, and the workbench copies instead of
// saving.
import { createContext, useCallback, useContext, useState } from 'react';

import type { TokenMeta } from './data';

export type SavedEdit = {
  id: string;
  kind: 'token' | 'style' | 'setup';
  label: string;
  at: number;
  files: string[];
};

export type LocalStatus = {
  branch: string;
  protected: boolean;
  upstream: string | null;
  ahead: number | null;
  edits: SavedEdit[];
};

export type Pushed = {
  // A token edit commits on this branch; a component edit is a heal, on
  // its own branch off master.
  pushed: {
    kind: 'token' | 'heal';
    sha: string;
    branch: string;
    subject: string;
  }[];
  held: string | null;
};

const API = '/__ds/';

const asStatus = (v: unknown): LocalStatus | undefined =>
  v && typeof v === 'object' && 'branch' in v && 'edits' in v
    ? (v as LocalStatus)
    : undefined;

// Undefined when there is no local API: a 404 page, a timeout, no JSON.
export const detectLocal = async (): Promise<LocalStatus | undefined> => {
  try {
    const res = await fetch(`${API}status`, {
      signal: AbortSignal.timeout(2000),
    });
    if (!res.ok) return undefined;
    return asStatus(await res.json());
  } catch {
    return undefined;
  }
};

export const loadLiveTokens = async () => {
  const res = await fetch(`${API}tokens`);
  if (!res.ok) throw new Error(`tokens ${res.status}`);
  return (await res.json()) as { meta: TokenMeta[]; source: unknown };
};

export class LocalError extends Error {}

const post = async <T>(route: string, body: unknown): Promise<T> => {
  const res = await fetch(`${API}${route}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new LocalError(json.error ?? `Failed (${res.status}).`);
  return json as T;
};

export type Local = {
  status: LocalStatus;
  busy: boolean;
  error?: string;
  saveTokens: (patch: unknown[], label: string) => Promise<boolean>;
  saveStyle: (
    at: { file: string; line: number; col: number },
    to: { token?: string; value?: string },
    label: string
  ) => Promise<boolean>;
  undo: (id: string) => Promise<boolean>;
  push: (branch?: string) => Promise<Pushed | undefined>;
};

export const LocalContext = createContext<Local | undefined>(undefined);
export const useLocal = () => useContext(LocalContext);

export const useLocalApi = (initial?: LocalStatus): Local | undefined => {
  const [status, setStatus] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const run = useCallback(
    async <T>(route: string, body: unknown): Promise<T | undefined> => {
      setBusy(true);
      setError(undefined);
      try {
        const out = await post<T & LocalStatus>(route, body);
        setStatus(asStatus(out) ?? status);
        return out;
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
        return undefined;
      } finally {
        setBusy(false);
      }
    },
    [status]
  );
  if (!status) return undefined;
  return {
    status,
    busy,
    error,
    saveTokens: async (patch, label) =>
      !!(await run('token', { patch, label })),
    saveStyle: async (at, to, label) =>
      !!(await run('style', { ...at, ...to, label })),
    undo: async (id) => !!(await run('undo', { id })),
    push: (branch) => run<Pushed>('push', branch ? { branch } : {}),
  };
};
