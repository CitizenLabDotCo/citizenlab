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
  capturedImages?: Map<
    string,
    { image: Uint8Array; width: number; height: number }
  >;
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
          capturedImages,
          surveyResults,
          surveyTotalSubmissions,
        } = data;

        // Import ImageRun and Paragraph for chart images
        const { ImageRun, Paragraph } = await import('docx');

        const getImageTransform = (
          width: number,
          height: number,
          maxWidth = 600,
          maxHeight?: number
        ) => {
          if (width <= 0 || height <= 0) {
            return { width: maxWidth, height: Math.round(maxWidth * 0.6) };
          }

          const heightScale =
            typeof maxHeight === 'number' ? maxHeight / height : Infinity;
          const scale = Math.min(maxWidth / width, heightScale);
          return {
            width: Math.round(width * scale),
            height: Math.round(height * scale),
          };
        };

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

        const appendCapturedSection = (
          exportId: string,
          heading: MessageDescriptor,
          maxWidth = 600,
          maxHeight?: number
        ) => {
          const imageData = capturedImages?.get(exportId);
          if (!imageData) return false;

          const { width, height } = getImageTransform(
            imageData.width,
            imageData.height,
            maxWidth,
            maxHeight
          );

          children.push(
            createHeading(formatMessage(heading), 2),
            new Paragraph({
              children: [
                new ImageRun({
                  data: imageData.image,
                  transformation: {
                    width,
                    height,
                  },
                  type: 'png',
                }),
              ],
            }),
            createEmptyParagraph()
          );

          return true;
        };

        // Participation Over Time Chart (Timeline)
        appendCapturedSection(
          'participation-timeline',
          messages.participationOverTime,
          600
        );

        // Demographics Section - prefer per-field images, fall back to single image, then data tables
        const demographicFieldKeys = Array.from(
          capturedImages?.keys() || []
        )
          .filter((key) => key.startsWith('demographics-field-'))
          .sort((a, b) => {
            const ai = parseInt(a.replace('demographics-field-', ''));
            const bi = parseInt(b.replace('demographics-field-', ''));
            return ai - bi;
          });

        if (demographicFieldKeys.length > 0) {
          children.push(
            createHeading(formatMessage(messages.demographics), 2)
          );
          for (const key of demographicFieldKeys) {
            const imageData = capturedImages?.get(key);
            if (!imageData) continue;
            const { width, height } = getImageTransform(
              imageData.width,
              imageData.height,
              600
            );
            children.push(
              new Paragraph({
                children: [
                  new ImageRun({
                    data: imageData.image,
                    transformation: { width, height },
                    type: 'png',
                  }),
                ],
              }),
              createEmptyParagraph()
            );
          }
        } else {
          const demographicsCaptured = appendCapturedSection(
            'demographics',
            messages.demographics,
            600
          );
          if (
            !demographicsCaptured &&
            demographics &&
            demographics.length > 0
          ) {
            children.push(
              ...createDemographicsSection(demographics, intl),
              createEmptyParagraph()
            );
          }
        }

        // Survey Results (only for native_survey)
        const surveyItemKeys =
          participationMethod === 'native_survey'
            ? Array.from(capturedImages?.keys() || []).filter((key) =>
                key.startsWith('survey-results-item-')
              )
            : [];
        const surveyItemsCaptured =
          participationMethod === 'native_survey' && surveyItemKeys.length > 0;

        if (surveyItemsCaptured) {
          const sortedSurveyKeys = surveyItemKeys
            .map((key) => {
              const indexText = key.replace('survey-results-item-', '');
              const index = Number.parseInt(indexText, 10);
              return { key, index };
            })
            .filter(({ index }) => Number.isFinite(index))
            .sort((a, b) => a.index - b.index)
            .map(({ key }) => key);

          children.push(
            createHeading(formatMessage(messages.surveyResults), 2)
          );

          sortedSurveyKeys.forEach((key) => {
            const imageData = capturedImages?.get(key);
            if (!imageData) return;
            const { width, height } = getImageTransform(
              imageData.width,
              imageData.height,
              600
            );
            children.push(
              new Paragraph({
                children: [
                  new ImageRun({
                    data: imageData.image,
                    transformation: { width, height },
                    type: 'png',
                  }),
                ],
              }),
              createEmptyParagraph()
            );
          });
        }

        const surveyCaptured =
          participationMethod === 'native_survey' &&
          !surveyItemsCaptured &&
          appendCapturedSection('survey-results', messages.surveyResults, 600);
        if (
          !surveyCaptured &&
          !surveyItemsCaptured &&
          participationMethod === 'native_survey' &&
          surveyResults
        ) {
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
        if (showIdeaSections) {
          const aiSummaryCaptured = appendCapturedSection(
            'ai-summary',
            messages.aiSummary,
            600
          );
          if (!aiSummaryCaptured && aiSummary) {
            children.push(...createAiSummarySection(aiSummary, intl));
          }
        }

        // Topic Breakdown
        if (showIdeaSections) {
          const topicBreakdownCaptured = appendCapturedSection(
            'topic-breakdown',
            messages.topicBreakdown,
            600
          );
          if (!topicBreakdownCaptured && topicBreakdown) {
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
        }

        // Status Breakdown
        if (showIdeaSections) {
          const statusBreakdownCaptured = appendCapturedSection(
            'status-breakdown',
            messages.statusBreakdown,
            600
          );
          if (
            !statusBreakdownCaptured &&
            statusBreakdown &&
            statusBreakdown.length > 0
          ) {
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
        }

        // Most Liked Ideas/Proposals - prefer per-card images, fall back to single image, then data
        if (showIdeaSections) {
          const mostLikedPrefix =
            participationMethod === 'proposals'
              ? 'most-liked-proposal-'
              : 'most-liked-idea-';
          const mostLikedHeading =
            participationMethod === 'proposals'
              ? messages.mostLikedProposals
              : messages.mostLikedIdeas;

          const mostLikedKeys = Array.from(
            capturedImages?.keys() || []
          )
            .filter((key) => key.startsWith(mostLikedPrefix))
            .sort((a, b) => {
              const ai = parseInt(a.replace(mostLikedPrefix, ''));
              const bi = parseInt(b.replace(mostLikedPrefix, ''));
              return ai - bi;
            });

          if (mostLikedKeys.length > 0) {
            children.push(
              createHeading(formatMessage(mostLikedHeading), 2)
            );
            for (const key of mostLikedKeys) {
              const imageData = capturedImages?.get(key);
              if (!imageData) continue;
              const { width, height } = getImageTransform(
                imageData.width,
                imageData.height,
                600
              );
              children.push(
                new Paragraph({
                  children: [
                    new ImageRun({
                      data: imageData.image,
                      transformation: { width, height },
                      type: 'png',
                    }),
                  ],
                }),
                createEmptyParagraph()
              );
            }
          } else {
            const mostLikedExportId =
              participationMethod === 'proposals'
                ? 'most-liked-proposals'
                : 'most-liked-ideas';
            const mostLikedCaptured = appendCapturedSection(
              mostLikedExportId,
              mostLikedHeading,
              600
            );
            if (
              !mostLikedCaptured &&
              mostLikedIdeas &&
              mostLikedIdeas.length > 0
            ) {
              const type =
                participationMethod === 'proposals' ? 'proposals' : 'ideas';
              children.push(
                ...createMostLikedSection(mostLikedIdeas, intl, type)
              );
            }
          }
        }

        // Vote Results (captured as image)
        if (participationMethod === 'voting') {
          appendCapturedSection('vote-results', messages.voteResults, 600);
        }

        // Common Ground Results (captured as image)
        if (participationMethod === 'common_ground') {
          appendCapturedSection(
            'common-ground-results',
            messages.commonGroundResults,
            600
          );
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
