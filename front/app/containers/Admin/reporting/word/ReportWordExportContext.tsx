import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { SerializedNodes, useEditor } from '@craftjs/core';
import { SupportedLocale } from 'typings';

import useReport from 'api/reports/useReport';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useLocale from 'hooks/useLocale';

import { useIntl } from 'utils/cl-intl';
import { getLocalized } from 'utils/i18n';
import { htmlToImageBuffer } from 'utils/word/utils/htmlToImage';

import { WIDGET_TITLES } from '../components/ReportBuilder/Widgets';
import { useReportContext } from '../context/ReportContext';

import messages from './messages';
import useReportWordDownload, {
  ReportWordSection,
} from './useReportWordDownload';

type ExportStatus = 'idle' | 'preparing' | 'capturing' | 'generating';

interface ExportProgress {
  completed: number;
  total: number;
}

interface WordExportContextValue {
  downloadWord: () => Promise<void>;
  isDownloading: boolean;
  error: string | null;
  status: ExportStatus;
  progress: ExportProgress;
}

const WordExportContext = createContext<WordExportContextValue>({
  downloadWord: async () => {},
  isDownloading: false,
  error: null,
  status: 'idle',
  progress: { completed: 0, total: 0 },
});

interface WordExportProviderProps {
  children: React.ReactNode;
}

type ExportNode =
  | { type: 'text'; html: string }
  | { type: 'whitespace'; size?: 'small' | 'medium' | 'large' }
  | { type: 'iframe'; url: string; title?: string }
  | { type: 'image'; nodeId: string; widgetName: string };

const EXPORTABLE_WIDGETS = new Set(Object.keys(WIDGET_TITLES));
const CONTAINER_NODES = new Set([
  'Container',
  'Box',
  'TwoColumn',
  'ProjectTemplate',
  'PhaseTemplate',
  'PlatformTemplate',
  'CommunityMonitorTemplate',
]);

type SerializedNodeWithProps = SerializedNodes[string] & {
  type?: string | { resolvedName?: string };
  props?: Record<string, any>;
  nodes: string[];
  linkedNodes: Record<string, string>;
};

const getTextFromMultiloc = (
  multiloc: Record<string, string> | undefined,
  locale: SupportedLocale | undefined,
  tenantLocales: SupportedLocale[] | undefined
) => {
  if (!multiloc || !locale || !tenantLocales) return '';
  return getLocalized(multiloc, locale, tenantLocales);
};

const buildExportNodes = (
  nodes: SerializedNodes,
  locale: SupportedLocale | undefined,
  tenantLocales: SupportedLocale[] | undefined
) => {
  const rootChildren = nodes.ROOT.nodes;

  const walkNode = (nodeId: string): ExportNode[] => {
    const node = nodes[nodeId] as SerializedNodeWithProps | undefined;
    if (!node) return [];

    const nodeName =
      typeof node.type === 'object' ? node.type.resolvedName : node.type;
    const children = Array.from(
      new Set([...node.nodes, ...Object.values(node.linkedNodes)])
    );

    if (!nodeName) {
      return children.flatMap(walkNode);
    }

    if (nodeName === 'TextMultiloc') {
      const html = getTextFromMultiloc(node.props?.text, locale, tenantLocales);
      return html ? [{ type: 'text', html }] : [];
    }

    if (nodeName === 'WhiteSpace') {
      return [
        {
          type: 'whitespace',
          size: node.props?.size,
        },
      ];
    }

    if (nodeName === 'IframeMultiloc') {
      const url = node.props?.url;
      const title = getTextFromMultiloc(
        node.props?.title,
        locale,
        tenantLocales
      );
      return url ? [{ type: 'iframe', url, title }] : [];
    }

    if (CONTAINER_NODES.has(nodeName)) {
      return children.flatMap(walkNode);
    }

    if (EXPORTABLE_WIDGETS.has(nodeName)) {
      return [{ type: 'image', nodeId, widgetName: nodeName }];
    }

    return children.flatMap(walkNode);
  };

  return rootChildren.flatMap(walkNode);
};

export const ReportWordExportProvider = ({
  children,
}: WordExportProviderProps) => {
  const { reportId, contentBuilderLocale } = useReportContext();
  const { formatMessage } = useIntl();
  const { data: report } = useReport(reportId);
  const platformLocale = useLocale();
  const tenantLocales = useAppConfigurationLocales();
  const locale = contentBuilderLocale || platformLocale;

  const { query } = useEditor();
  const [status, setStatus] = useState<ExportStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<ExportProgress>({
    completed: 0,
    total: 0,
  });

  const { downloadWord: downloadWordDoc, error: downloadError } =
    useReportWordDownload({
      filename: report?.data.attributes.name || 'report',
      errorMessage: formatMessage(messages.wordExportFailed),
    });

  useEffect(() => {
    if (downloadError) {
      setError(downloadError);
    }
  }, [downloadError]);

  const downloadWord = useCallback(async () => {
    if (status !== 'idle') return;

    setStatus('preparing');
    setError(null);

    try {
      const serializedNodes = query.getSerializedNodes();
      const exportNodes = buildExportNodes(
        serializedNodes,
        locale,
        tenantLocales
      );

      const captureCount = exportNodes.filter(
        (node) => node.type === 'image'
      ).length;

      setProgress({ completed: 0, total: captureCount });
      setStatus('capturing');

      const sections: ReportWordSection[] = [];
      let completedCaptures = 0;

      for (const node of exportNodes) {
        if (node.type === 'text') {
          sections.push({ type: 'text', html: node.html });
          continue;
        }

        if (node.type === 'whitespace') {
          sections.push({ type: 'whitespace', size: node.size });
          continue;
        }

        if (node.type === 'iframe') {
          sections.push({
            type: 'iframe',
            url: node.url,
            title: node.title,
          });
          continue;
        }

        const element = document.getElementById(node.nodeId);
        if (!element) {
          sections.push({
            type: 'error',
            message: formatMessage(messages.wordExportMissingWidget),
          });
          continue;
        }

        element.scrollIntoView({ block: 'center' });
        const { width, height } = element.getBoundingClientRect();

        try {
          const imageBuffer = await htmlToImageBuffer(element, {
            scale: 2,
            backgroundColor: '#FFFFFF',
          });

          sections.push({
            type: 'image',
            image: imageBuffer,
            width,
            height,
            widgetName: node.widgetName,
          });
        } catch (err) {
          sections.push({
            type: 'error',
            message: formatMessage(messages.wordExportCaptureFailed),
          });
        } finally {
          completedCaptures += 1;
          setProgress({ completed: completedCaptures, total: captureCount });
        }
      }

      setStatus('generating');

      await downloadWordDoc({
        reportTitle:
          report?.data.attributes.name ||
          formatMessage(messages.reportFallbackTitle),
        sections,
      });
    } catch (err) {
      setError(formatMessage(messages.wordExportFailed));
    } finally {
      setStatus('idle');
    }
  }, [
    downloadWordDoc,
    formatMessage,
    locale,
    query,
    report?.data.attributes.name,
    status,
    tenantLocales,
  ]);

  const contextValue = useMemo(
    () => ({
      downloadWord,
      isDownloading: status !== 'idle',
      error,
      status,
      progress,
    }),
    [downloadWord, error, progress, status]
  );

  return (
    <WordExportContext.Provider value={contextValue}>
      {children}
    </WordExportContext.Provider>
  );
};

export const useReportWordExportContext = () => useContext(WordExportContext);
