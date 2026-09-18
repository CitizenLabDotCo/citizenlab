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

interface PhaseSaveContextValue {
  register: (key: string, save: SaveFn) => () => void;
  setDirty: (key: string, dirty: boolean) => void;
  dirty: boolean;
  saving: boolean;
  /** Saves every panel with changes. Resolves to whether all of them saved. */
  saveAll: (reason: SaveReason) => Promise<boolean>;
  /** Drops every unsaved change. Panels key on `revision` to start over. */
  discardAll: () => void;
  revision: number;
}

const PhaseSaveContext = createContext<PhaseSaveContextValue | null>(null);

// The panels of a phase keep their own unsaved changes. This collects them, so
// one button in the header saves them all and leaving the page can be stopped.
export const PhaseSaveProvider = ({ children }: { children: ReactNode }) => {
  const savers = useRef(new Map<string, SaveFn>());
  const [dirtyKeys, setDirtyKeys] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [revision, setRevision] = useState(0);

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
      const results = await Promise.allSettled(
        dirtyKeys.flatMap((key) => {
          const save = savers.current.get(key);
          return save ? [save(reason)] : [];
        })
      );
      setSaving(false);
      return results.every(({ status }) => status === 'fulfilled');
    },
    [dirtyKeys]
  );

  const value = useMemo(() => {
    const dirty = dirtyKeys.length > 0;

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
    };
  }, [register, setDirty, dirtyKeys, saving, saveAll, revision]);

  return (
    <PhaseSaveContext.Provider value={value}>
      {children}
    </PhaseSaveContext.Provider>
  );
};

export const usePhaseSave = () => useContext(PhaseSaveContext);

// The latest save function is read through a ref, so the registration doesn't
// change on every render.
export const useRegisterPhaseSaver = (
  key: string,
  { dirty, save }: { dirty: boolean; save: SaveFn }
) => {
  const context = usePhaseSave();
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
