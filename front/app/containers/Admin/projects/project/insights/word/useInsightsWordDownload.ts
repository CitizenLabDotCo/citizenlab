import { useState, useCallback } from 'react';

import { saveAs } from 'file-saver';
import { MessageDescriptor } from 'react-intl';

import type { IIdeaData } from 'api/ideas/types';
import type {
  PhaseInsightsParticipationMetrics,
  DemographicField,
} from 'api/phase_insights/types';
import type { ParticipationMethod } from 'api/phases/types';
import type { ResultUngrouped } from 'api/survey_results/types';

import type { Localize } from 'hooks/useLocalize';

import { FormatMessageValues } from 'utils/cl-intl/useIntl';
import { createBreakdownTable } from 'utils/word/converters/breakdownBarConverter';
import {
  createTitle,
  createHeading,
  createEmptyParagraph,
} from 'utils/word/converters/textConverter';
import { WORD_MARGINS, WORD_PAGE_SIZE } from 'utils/word/utils/styleConstants';

import { isIdeaBasedMethod } from '../config/sectionConfig';

export interface WordExportIntl {
  formatMessage: (
    descriptor: MessageDescriptor,
    values?: FormatMessageValues
  ) => string;
  locale: string;
  localize: Localize;
}

import { createAiSummarySection } from './insightConverters/aiSummaryConverter';
import { createDemographicsSection } from './insightConverters/demographicsConverter';
import { createMostLikedSection } from './insightConverters/ideaListConverter';
import { createMetricsSection } from './insightConverters/metricsConverter';
import { createSurveyResultsSection } from './insightConverters/surveyResultsConverter';
import messages from './messages';

interface UseInsightsWordDownloadOptions {
  filename?: string;
  errorMessage: string;
}

interface UseInsightsWordDownloadReturn {
  downloadWord: (data: InsightsWordData) => Promise<void>;
  isDownloading: boolean;
  error: string | null;
}

export interface InsightsWordData {
  phaseName: string;
  metrics: PhaseInsightsParticipationMetrics;
  demographics?: DemographicField[];
  aiSummary?: string | null;
  topicBreakdown?: {
    aiTopics: Array<{
      id: string;
      name: string;
      count: number;
      percentage: number;
    }>;
    manualTopics: Array<{
      id: string;
      name: string;
      count: number;
      percentage: number;
    }>;
  };
  statusBreakdown?: Array<{
    id: string;
    name: string;
    count: number;
    color: string;
  }>;
  mostLikedIdeas?: IIdeaData[];
  participationMethod?: ParticipationMethod;
  intl: WordExportIntl;
  // Chart images
  timelineImage?: Uint8Array;
  demographicImages?: Map<string, Uint8Array>;
  // Survey-specific data
  surveyResults?: ResultUngrouped[];
  surveyTotalSubmissions?: number;
}

/**
 * Hook for downloading insights tab content as a Word document.
 * Uses the docx library to generate documents programmatically.
 */
export default function useInsightsWordDownload({
  errorMessage,
  filename = 'insights',
}: UseInsightsWordDownloadOptions): UseInsightsWordDownloadReturn {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadWord = useCallback(
    async (data: InsightsWordData) => {
      setIsDownloading(true);
      setError(null);

      try {
        // Lazy load docx to reduce initial bundle size
        const { Document, Packer } = await import('docx');

        const {
          phaseName,
          metrics,
          demographics,
          aiSummary,
          topicBreakdown,
          statusBreakdown,
          mostLikedIdeas,
          participationMethod,
          intl,
          timelineImage,
          demographicImages,
          surveyResults,
          surveyTotalSubmissions,
        } = data;

        // Import ImageRun and Paragraph for chart images
        const { ImageRun, Paragraph } = await import('docx');

        // Build document sections
        const children = [
          // Title
          createTitle(`${phaseName} - Insights`),
          createEmptyParagraph(),

          // Participation Metrics
          ...createMetricsSection(metrics, intl, true),
          createEmptyParagraph(),
        ];

        const { formatMessage } = intl;

        // Participation Over Time Chart (Timeline)
        if (timelineImage) {
          children.push(
            createHeading(formatMessage(messages.participationOverTime), 2),
            new Paragraph({
              children: [
                new ImageRun({
                  data: timelineImage,
                  transformation: {
                    width: 600,
                    height: 260,
                  },
                  type: 'png',
                }),
              ],
            }),
            createEmptyParagraph()
          );
        }

        // Demographics Section - use images if available, otherwise fall back to tables
        if (demographicImages && demographicImages.size > 0) {
          children.push(createHeading(formatMessage(messages.demographics), 2));

          for (const [fieldName, imageData] of demographicImages.entries()) {
            children.push(
              createHeading(fieldName, 3),
              new Paragraph({
                children: [
                  new ImageRun({
                    data: imageData,
                    transformation: {
                      width: 600,
                      height: 200,
                    },
                    type: 'png',
                  }),
                ],
              }),
              createEmptyParagraph()
            );
          }
        } else if (demographics && demographics.length > 0) {
          // Fall back to table-based demographics if no images available
          children.push(
            ...createDemographicsSection(demographics, intl),
            createEmptyParagraph()
          );
        }

        // Survey Results (only for native_survey)
        if (participationMethod === 'native_survey' && surveyResults) {
          children.push(
            ...createSurveyResultsSection(
              surveyResults,
              surveyTotalSubmissions || 0,
              intl
            ),
            createEmptyParagraph()
          );
        }

        // Method-specific sections (only ideation and proposals)
        const showIdeaSections = isIdeaBasedMethod(participationMethod);

        // AI Summary
        if (showIdeaSections && aiSummary) {
          children.push(...createAiSummarySection(aiSummary, intl));
        }

        // Topic Breakdown
        if (showIdeaSections && topicBreakdown) {
          if (topicBreakdown.aiTopics.length > 0) {
            children.push(
              ...createBreakdownTable(
                topicBreakdown.aiTopics.map((t) => ({
                  id: t.id,
                  name: t.name,
                  count: t.count,
                  percentage: t.percentage,
                })),
                { title: 'AI-Detected Topics' }
              ),
              createEmptyParagraph()
            );
          }

          if (topicBreakdown.manualTopics.length > 0) {
            children.push(
              ...createBreakdownTable(
                topicBreakdown.manualTopics.map((t) => ({
                  id: t.id,
                  name: t.name,
                  count: t.count,
                  percentage: t.percentage,
                })),
                { title: 'Manual Tags' }
              ),
              createEmptyParagraph()
            );
          }
        }

        // Status Breakdown
        if (showIdeaSections && statusBreakdown && statusBreakdown.length > 0) {
          const maxCount = Math.max(...statusBreakdown.map((s) => s.count));
          children.push(
            ...createBreakdownTable(
              statusBreakdown.map((s) => ({
                id: s.id,
                name: s.name,
                count: s.count,
                color: s.color.replace('#', ''),
                percentage: (s.count / maxCount) * 100,
              })),
              { title: 'Status Breakdown', showPercentage: false }
            ),
            createEmptyParagraph()
          );
        }

        // Most Liked Ideas/Proposals
        if (showIdeaSections && mostLikedIdeas && mostLikedIdeas.length > 0) {
          const type =
            participationMethod === 'proposals' ? 'proposals' : 'ideas';
          children.push(...createMostLikedSection(mostLikedIdeas, intl, type));
        }

        // Create the document
        const doc = new Document({
          sections: [
            {
              properties: {
                page: {
                  size: {
                    width: WORD_PAGE_SIZE.width,
                    height: WORD_PAGE_SIZE.height,
                  },
                  margin: {
                    top: WORD_MARGINS.top,
                    right: WORD_MARGINS.right,
                    bottom: WORD_MARGINS.bottom,
                    left: WORD_MARGINS.left,
                  },
                },
              },
              children,
            },
          ],
        });

        // Generate and download
        const blob = await Packer.toBlob(doc);
        const timestamp = new Date()
          .toISOString()
          .replace(/[:.]/g, '-')
          .slice(0, 19);
        saveAs(blob, `${filename}-${timestamp}.docx`);
      } catch (err) {
        console.error('Word download error:', err);
        setError(errorMessage);
      } finally {
        setIsDownloading(false);
      }
    },
    [filename, errorMessage]
  );

  return {
    downloadWord,
    isDownloading,
    error,
  };
}
