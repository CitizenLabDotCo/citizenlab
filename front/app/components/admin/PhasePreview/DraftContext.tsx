import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { IUpdatedPhaseProperties } from 'api/phases/types';

type PhasePreviewDraft = IUpdatedPhaseProperties;

interface DraftEntry {
  phaseId: string;
  fields: PhasePreviewDraft;
}
interface DraftContextValue {
  entries: Partial<Record<string, DraftEntry>>;
  publish: (source: string, entry: DraftEntry) => void;
  remove: (source: string, phaseId: string) => void;
}
const DraftContext = createContext<DraftContextValue | null>(null);

export const PhasePreviewDraftProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [entries, setEntries] = useState<Partial<Record<string, DraftEntry>>>(
    {}
  );
  const publish = useCallback((source: string, entry: DraftEntry) => {
    setEntries((entries) => ({
      ...entries,
      [source]: {
        phaseId: entry.phaseId,
        fields: {
          ...(entries[source]?.phaseId === entry.phaseId
            ? entries[source].fields
            : {}),
          ...entry.fields,
        },
      },
    }));
  }, []);
  const remove = useCallback((source: string, phaseId: string) => {
    setEntries((entries) => {
      if (entries[source]?.phaseId !== phaseId) return entries;
      const next = { ...entries };
      delete next[source];
      return next;
    });
  }, []);
  const value = useMemo(
    () => ({ entries, publish, remove }),
    [entries, publish, remove]
  );
  return (
    <DraftContext.Provider value={value}>{children}</DraftContext.Provider>
  );
};

// Editors publish changes from their event handlers. Unmounting an editor
// clears its preview patch on discard, method switch or navigation.
export const usePhasePreviewPublisher = (source: string, phaseId: string) => {
  const context = useContext(DraftContext);
  const publish = context?.publish;
  const remove = context?.remove;
  useEffect(() => () => remove?.(source, phaseId), [remove, source, phaseId]);
  return useCallback(
    (fields: PhasePreviewDraft) => publish?.(source, { phaseId, fields }),
    [publish, source, phaseId]
  );
};

export const usePhasePreviewDraft = (phaseId: string | undefined) => {
  const context = useContext(DraftContext);
  return Object.values(context?.entries ?? {}).reduce<PhasePreviewDraft>(
    (fields, entry) =>
      entry?.phaseId === phaseId ? { ...fields, ...entry?.fields } : fields,
    {}
  );
};
