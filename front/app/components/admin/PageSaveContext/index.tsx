import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

export type SaveReason = 'button' | 'leave';

type SaveFn = (reason: SaveReason) => Promise<void>;

interface PageSaveContextValue {
  register: (key: string, save: SaveFn) => () => void;
  setDirty: (key: string, dirty: boolean) => void;
  dirty: boolean;
  saving: boolean;
  /** Resolves to the keys of the panels whose save failed. */
  saveAll: (reason: SaveReason) => Promise<string[]>;
  discardAll: () => void;
  revision: number;
  leave: () => void;
  isLeaving: () => boolean;
}

const PageSaveContext = createContext<PageSaveContextValue | null>(null);

// The panels of a page (a phase's, or an event's) keep their own unsaved
// changes. This collects them, so one button in the header saves them all and
// leaving the page can be stopped.
export const PageSaveProvider = ({ children }: { children: ReactNode }) => {
  const savers = useRef(new Map<string, SaveFn>());
  const [dirtyKeys, setDirtyKeys] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [revision, setRevision] = useState(0);

  const dirty = dirtyKeys.length > 0;

  const leaving = useRef(false);

  useEffect(() => {
    if (dirty) leaving.current = false;
  }, [dirty]);

  const leave = useCallback(() => {
    leaving.current = true;
  }, []);
  const isLeaving = useCallback(() => leaving.current, []);

  const register = useCallback((key: string, save: SaveFn) => {
    savers.current.set(key, save);
    return () => {
      savers.current.delete(key);
      setDirtyKeys((keys) => keys.filter((k) => k !== key));
    };
  }, []);

  const setDirty = useCallback((key: string, dirty: boolean) => {
    setDirtyKeys((keys) => {
      if (keys.includes(key) === dirty) return keys;
      return dirty ? [...keys, key] : keys.filter((k) => k !== key);
    });
  }, []);

  const saveAll = useCallback(
    async (reason: SaveReason) => {
      setSaving(true);
      const keys = dirtyKeys.filter((key) => savers.current.has(key));
      const results = await Promise.allSettled(
        keys.map((key) => savers.current.get(key)?.(reason))
      );
      setSaving(false);
      return keys.filter((_key, i) => results[i].status === 'rejected');
    },
    [dirtyKeys]
  );

  const value = useMemo(() => {
    return {
      register,
      setDirty,
      dirty,
      saving,
      saveAll,
      discardAll: () => {
        setDirtyKeys([]);
        setRevision((revision) => revision + 1);
      },
      revision,
      leave,
      isLeaving,
    };
  }, [register, setDirty, dirty, saving, saveAll, revision, leave, isLeaving]);

  return (
    <PageSaveContext.Provider value={value}>
      {children}
    </PageSaveContext.Provider>
  );
};

export const usePageSave = () => useContext(PageSaveContext);

export const useRegisterPageSaver = (
  key: string,
  { dirty, save }: { dirty: boolean; save: SaveFn }
) => {
  const context = usePageSave();
  const saveRef = useRef(save);
  saveRef.current = save;

  const register = context?.register;
  const setDirty = context?.setDirty;

  useEffect(() => {
    if (!register) return;
    return register(key, (reason) => saveRef.current(reason));
  }, [register, key]);

  useEffect(() => {
    setDirty?.(key, dirty);
  }, [setDirty, key, dirty]);
};
