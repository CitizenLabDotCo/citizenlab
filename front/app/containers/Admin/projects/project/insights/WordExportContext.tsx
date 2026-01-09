import React, {
  createContext,
  useContext,
  useCallback,
  useState,
  useRef,
  ReactNode,
} from 'react';

import { transformDemographicsResponse } from 'api/phase_insights/transformDemographics';
import usePhaseInsights from 'api/phase_insights/usePhaseInsights';
import { IPhaseData } from 'api/phases/types';

import useLocale from 'hooks/useLocale';
import useLocalize from 'hooks/useLocalize';
import useWordExport from 'hooks/useWordExport';

import { useIntl } from 'utils/cl-intl';
import {
  WordExportDocument,
  WordExportSection,
  rasterizeSvgToBase64,
  rasterizeHtmlToBase64,
} from 'utils/wordExport';

import InsightsPdfContent from './InsightsPdfContent';
import messages from './messages';

interface WordExportContextValue {
  downloadWord: () => Promise<void>;
  isDownloading: boolean;
  error: string | null;
}

const WordExportContext = createContext<WordExportContextValue>({
  downloadWord: async () => {},
  isDownloading: false,
  error: null,
});

interface WordExportProviderProps {
  children: ReactNode;
  filename: string;
  phase: IPhaseData;
}

export const WordExportProvider = ({
  children,
  filename,
  phase,
}: WordExportProviderProps) => {
  const { formatMessage } = useIntl();
  const locale = useLocale();
  const localize = useLocalize();
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs for capturing charts
  const timelineChartRef = useRef<SVGElement>(null);
  const demographicChartsRef = useRef<Map<string, HTMLElement | null>>(
    new Map()
  );

  // Callback to collect demographic chart refs
  const handleDemographicChartRef = useCallback(
    (fieldId: string, el: HTMLElement | null) => {
      if (el) {
        demographicChartsRef.current.set(fieldId, el);
      } else {
        demographicChartsRef.current.delete(fieldId);
      }
    },
    []
  );

  // Fetch insights data
  const { data: insightsData } = usePhaseInsights({
    phaseId: phase.id,
  });

  const { downloadWord: downloadWordDoc } = useWordExport({
    filename,
    locale,
    errorMessage: formatMessage(messages.errorWordDownload),
  });

  const phaseName =
    localize(phase.attributes.title_multiloc) ||
    Object.values(phase.attributes.title_multiloc)[0] ||
    '';

  const downloadWord = useCallback(async () => {
    if (!insightsData) {
      setError(formatMessage(messages.errorWordDownload));
      return;
    }

    setIsDownloading(true);
    setError(null);

    try {
      // Wait for React to render the hidden container and charts
      await new Promise((resolve) => setTimeout(resolve, 500));

      const sections: WordExportSection[] = [];

      // 1. Title
      sections.push({
        type: 'text',
        content: phaseName,
        variant: 'h1',
      });

      sections.push({
        type: 'text',
        content: formatMessage(messages.insights),
        variant: 'h2',
      });

      sections.push({ type: 'whitespace', size: 'medium' });

      // 2. Participation Metrics Table - from API data
      const metrics = insightsData.data.attributes.metrics;
      const metricsHeaders: string[] = [
        formatMessage(messages.visitors),
        formatMessage(messages.participants),
        formatMessage(messages.participationRate),
      ];
      const metricsValues: string[] = [
        String(metrics.visitors),
        String(metrics.participants),
        `${(metrics.participation_rate * 100).toFixed(1)}%`,
      ];

      // Add method-specific metrics
      if (metrics.ideation) {
        metricsHeaders.push(formatMessage(messages.ideasPosted));
        metricsValues.push(String(metrics.ideation.ideas_posted));
        metricsHeaders.push(formatMessage(messages.comments));
        metricsValues.push(String(metrics.ideation.comments_posted));
        metricsHeaders.push(formatMessage(messages.reactions));
        metricsValues.push(String(metrics.ideation.reactions));
      }

      if (metrics.proposals) {
        metricsHeaders.push(formatMessage(messages.ideasPosted));
        metricsValues.push(String(metrics.proposals.ideas_posted));
        metricsHeaders.push(formatMessage(messages.comments));
        metricsValues.push(String(metrics.proposals.comments_posted));
      }

      if (metrics.native_survey) {
        metricsHeaders.push(formatMessage(messages.submissions));
        metricsValues.push(String(metrics.native_survey.submitted_surveys));
        metricsHeaders.push(formatMessage(messages.completionRate));
        metricsValues.push(
          `${(metrics.native_survey.completion_rate * 100).toFixed(1)}%`
        );
      }

      if (metrics.voting) {
        metricsHeaders.push(formatMessage(messages.votes));
        metricsValues.push(String(metrics.voting.online_votes));
      }

      if (metrics.poll) {
        metricsHeaders.push(formatMessage(messages.responses));
        metricsValues.push(String(metrics.poll.responses));
      }

      if (metrics.volunteering) {
        metricsHeaders.push(formatMessage(messages.volunteerings));
        metricsValues.push(String(metrics.volunteering.volunteerings));
      }

      sections.push({
        type: 'table',
        headers: metricsHeaders,
        rows: [metricsValues],
      });

      sections.push({ type: 'whitespace', size: 'medium' });

      // 3. Timeline Chart - from ref
      sections.push({
        type: 'text',
        content: formatMessage(messages.participationOverTime),
        variant: 'h3',
      });

      if (timelineChartRef.current) {
        try {
          const timelineImageData = await rasterizeSvgToBase64(
            timelineChartRef.current
          );
          sections.push({
            type: 'chart',
            imageData: timelineImageData,
            width: 600,
            height: 280,
          });
        } catch (err) {
          console.error('Failed to capture timeline chart:', err);
          sections.push({
            type: 'text',
            content: '[Timeline chart could not be exported]',
            variant: 'paragraph',
          });
        }
      }

      sections.push({ type: 'whitespace', size: 'medium' });

      // 4. Demographics - from refs + API data
      const blankLabel = formatMessage(messages.noAnswer);
      const demographicsData = insightsData.data.attributes.demographics;

      if (demographicsData.fields.length > 0) {
        sections.push({
          type: 'text',
          content: formatMessage(messages.demographicsAndAudience),
          variant: 'h3',
        });

        const transformedDemographics = transformDemographicsResponse(
          demographicsData,
          localize,
          blankLabel
        );

        for (const field of transformedDemographics.fields) {
          sections.push({
            type: 'text',
            content: field.field_name,
            variant: 'h4',
          });

          // Try to capture the chart
          const chartEl = demographicChartsRef.current.get(field.field_id);
          if (chartEl) {
            try {
              const chartImageData = await rasterizeHtmlToBase64(chartEl);
              sections.push({
                type: 'chart',
                imageData: chartImageData,
                width: 550,
                height: Math.max(150, field.data_points.length * 50),
              });
            } catch (err) {
              console.error(
                `Failed to capture demographic chart ${field.field_id}:`,
                err
              );
            }
          }

          // Also add data table for accessibility/text content
          const hasPopulationData = field.data_points.some(
            (p) => p.population_percentage !== undefined
          );
          const tableHeaders = hasPopulationData
            ? [
                formatMessage(messages.category),
                formatMessage(messages.participants),
                formatMessage(messages.totalPopulation),
              ]
            : [
                formatMessage(messages.category),
                formatMessage(messages.participants),
              ];

          const tableRows = field.data_points.map((point) => {
            const row = [point.label, `${point.percentage.toFixed(1)}%`];
            if (
              hasPopulationData &&
              point.population_percentage !== undefined
            ) {
              row.push(`${point.population_percentage.toFixed(1)}%`);
            }
            return row;
          });

          sections.push({
            type: 'table',
            headers: tableHeaders,
            rows: tableRows,
          });

          sections.push({ type: 'whitespace', size: 'small' });
        }
      }

      // Create and download the document
      const wordDocument: WordExportDocument = {
        title: `${phaseName} - ${formatMessage(messages.insights)}`,
        sections,
        metadata: {
          locale,
          createdAt: new Date(),
          author: 'Go Vocal',
        },
      };

      await downloadWordDoc(wordDocument);
    } catch (err) {
      console.error('Word export error:', err);
      setError(formatMessage(messages.errorWordDownload));
    } finally {
      setIsDownloading(false);
    }
  }, [
    insightsData,
    phaseName,
    locale,
    localize,
    formatMessage,
    downloadWordDoc,
  ]);

  return (
    <WordExportContext.Provider value={{ downloadWord, isDownloading, error }}>
      {children}
      {/* Hidden container for rendering export content with refs */}
      <div
        style={{
          position: 'fixed',
          left: '-9999px',
          top: 0,
          width: '800px',
          opacity: 0,
          pointerEvents: 'none',
        }}
      >
        <InsightsPdfContent
          phase={phase}
          timelineChartRef={timelineChartRef}
          onDemographicChartRef={handleDemographicChartRef}
        />
      </div>
    </WordExportContext.Provider>
  );
};

export const useWordExportContext = () => useContext(WordExportContext);
