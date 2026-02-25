/**
 * Word Export Context — thin coordinator.
 *
 * Accepts serializer registrations from section components.
 * On download: calls serializers in order, assembles WordSection[], renders to .docx.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from 'react';

import { saveAs } from 'file-saver';

import { ParticipationMethod } from 'api/phases/types';

import { useIntl } from 'utils/cl-intl';

import { getExpectedComponents, type ExportId } from './exportRegistry';
import messages from './messages';
import { sectionsToDocxBlob } from './wordRenderer';

import type { WordSerializer, WordSection } from './useWordSection';

export type ExportStatus = 'idle' | 'preparing' | 'capturing' | 'generating';

export interface ExportProgress {
  completed: number;
  total: number;
}

interface WordExportContextValue {
  // Public (used by download button)
  downloadWord: () => Promise<void>;
  isDownloading: boolean;
  exportStatus: ExportStatus;
  exportProgress: ExportProgress;
  error: string | null;

  // Registration (used by useWordSection hook)
  registerSerializer: (id: ExportId, fn: WordSerializer) => void;
  unregisterSerializer: (id: ExportId) => void;
  setSerializerSkipped: (id: ExportId, skip: boolean) => void;

  // Legacy compat — kept so ExportableInsight doesn't break during migration
  registerExportRef: (id: ExportId, ref: HTMLElement) => void;
  unregisterExportRef: (id: ExportId) => void;
  setExportSkipped: (id: ExportId, skip: boolean) => void;

  allComponentsReady: boolean;
  captureWarnings: string[];
}

const WordExportContext = createContext<WordExportContextValue>({
  downloadWord: async () => {},
  isDownloading: false,
  exportStatus: 'idle',
  exportProgress: { completed: 0, total: 0 },
  error: null,
  registerSerializer: () => {},
  unregisterSerializer: () => {},
  setSerializerSkipped: () => {},
  registerExportRef: () => {},
  unregisterExportRef: () => {},
  setExportSkipped: () => {},
  allComponentsReady: false,
  captureWarnings: [],
});

interface WordExportProviderProps {
  children: ReactNode;
  filename: string;
  title?: string;
  participationMethod?: ParticipationMethod;
}

export const WordExportProvider = ({
  children,
  filename,
  title,
  participationMethod,
}: WordExportProviderProps) => {
  const { formatMessage } = useIntl();

  // Serializer registry
  const serializers = useRef<Map<ExportId, WordSerializer>>(new Map());
  const skipped = useRef<Set<ExportId>>(new Set());
  // Bumped on every register/unregister/skip so `allComponentsReady` re-evaluates
  const [registrationVersion, setRegistrationVersion] = useState(0);

  // Status — matches UI expectations: preparing → capturing → generating → idle
  const [exportStatus, setExportStatus] = useState<ExportStatus>('idle');
  const [exportProgress, setExportProgress] = useState<ExportProgress>({
    completed: 0,
    total: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [captureWarnings, setCaptureWarnings] = useState<string[]>([]);

  const registerSerializer = useCallback((id: ExportId, fn: WordSerializer) => {
    serializers.current.set(id, fn);
    setRegistrationVersion((v) => v + 1);
  }, []);

  const unregisterSerializer = useCallback((id: ExportId) => {
    serializers.current.delete(id);
    skipped.current.delete(id);
    setRegistrationVersion((v) => v + 1);
  }, []);

  const setSerializerSkipped = useCallback((id: ExportId, skip: boolean) => {
    if (skip) skipped.current.add(id);
    else skipped.current.delete(id);
    setRegistrationVersion((v) => v + 1);
  }, []);

  // Legacy compat for ExportableInsight (no-ops — components migrated to useWordSection)
  const registerExportRef = useCallback(() => {}, []);
  const unregisterExportRef = useCallback(() => {}, []);
  const setExportSkipped = useCallback(
    (id: ExportId, skip: boolean) => setSerializerSkipped(id, skip),
    [setSerializerSkipped]
  );

  const downloadWord = useCallback(async () => {
    setExportStatus('preparing');
    setError(null);
    setCaptureWarnings([]);

    try {
      const orderedIds = getExpectedComponents(participationMethod);
      const warnings: string[] = [];
      setExportProgress({ completed: 0, total: orderedIds.length });

      // Small delay so React can re-render with 'preparing' status before we start
      await new Promise<void>((resolve) => setTimeout(resolve, 50));
      setExportStatus('capturing');

      const allSections: WordSection[] = [];

      for (let i = 0; i < orderedIds.length; i++) {
        const id = orderedIds[i];

        if (skipped.current.has(id)) {
          setExportProgress({ completed: i + 1, total: orderedIds.length });
          continue;
        }

        const serialize = serializers.current.get(id);
        if (!serialize) {
          setExportProgress({ completed: i + 1, total: orderedIds.length });
          continue;
        }

        try {
          const sections = await serialize();
          allSections.push(...sections);
        } catch {
          warnings.push(id);
        }

        setExportProgress({ completed: i + 1, total: orderedIds.length });
      }

      setCaptureWarnings(warnings);
      setExportStatus('generating');
      const blob = await sectionsToDocxBlob(allSections, {
        title: title || filename,
      });
      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, '-')
        .slice(0, 19);
      saveAs(blob, `${filename}-${timestamp}.docx`);
    } catch {
      setError(formatMessage(messages.errorWordDownload));
    } finally {
      setExportStatus('idle');
      setExportProgress({ completed: 0, total: 0 });
    }
  }, [filename, title, participationMethod, formatMessage]);

  const allComponentsReady = useMemo(() => {
    // registrationVersion is read to re-evaluate when components register/unregister
    void registrationVersion;
    const expected = getExpectedComponents(participationMethod);
    return expected.every(
      (id) => serializers.current.has(id) || skipped.current.has(id)
    );
  }, [participationMethod, registrationVersion]);

  const contextValue = useMemo(
    () => ({
      downloadWord,
      isDownloading: exportStatus !== 'idle',
      exportStatus,
      exportProgress,
      error,
      registerSerializer,
      unregisterSerializer,
      setSerializerSkipped,
      registerExportRef,
      unregisterExportRef,
      setExportSkipped,
      allComponentsReady,
      captureWarnings,
    }),
    [
      downloadWord,
      exportStatus,
      exportProgress,
      error,
      registerSerializer,
      unregisterSerializer,
      setSerializerSkipped,
      registerExportRef,
      unregisterExportRef,
      setExportSkipped,
      allComponentsReady,
      captureWarnings,
    ]
  );

  return (
    <WordExportContext.Provider value={contextValue}>
      {children}
    </WordExportContext.Provider>
  );
};

export const useWordExportContext = () => useContext(WordExportContext);
