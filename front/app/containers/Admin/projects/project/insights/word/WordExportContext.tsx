import React, {
  createContext,
  useContext,
  ReactNode,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useParams } from 'react-router-dom';

import useAnalyses from 'api/analyses/useAnalyses';
import useAnalysisInsights from 'api/analysis_insights/useAnalysisInsights';
import useAnalysisSummary from 'api/analysis_summaries/useAnalysisSummary';
import { IdeaStatusParticipationMethod } from 'api/idea_statuses/types';
import useIdeaStatuses from 'api/idea_statuses/useIdeaStatuses';
import useInfiniteIdeas from 'api/ideas/useInfiniteIdeas';
import useIdeasFilterCounts from 'api/ideas_filter_counts/useIdeasFilterCounts';
import { transformDemographicsResponse } from 'api/phase_insights/transformDemographics';
import usePhaseInsights from 'api/phase_insights/usePhaseInsights';
import usePhase from 'api/phases/usePhase';
import useSurveyResults from 'api/survey_results/useSurveyResults';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';
import { htmlToImageBuffer } from 'utils/word/utils/htmlToImage';

import { getAnalysisScope } from '../../../components/AnalysisBanner/utils';
import { isIdeaBasedMethod } from '../config/sectionConfig';
import useTopicBreakdownData from '../methodSpecific/shared/TopicBreakdown/useTopicBreakdownData';

import messages from './messages';
import useInsightsWordDownload, {
  InsightsWordData,
} from './useInsightsWordDownload';

interface WordExportContextValue {
  downloadWord: () => Promise<void>;
  isDownloading: boolean;
  error: string | null;
  // Ref registration functions
  registerTimelineRef: (ref: HTMLElement | null) => void;
  registerDemographicRef: (fieldName: string, ref: HTMLElement | null) => void;
}

const WordExportContext = createContext<WordExportContextValue>({
  downloadWord: async () => {},
  isDownloading: false,
  error: null,
  registerTimelineRef: () => {},
  registerDemographicRef: () => {},
});

interface WordExportProviderProps {
  children: ReactNode;
  filename: string;
}

export const WordExportProvider = ({
  children,
  filename,
}: WordExportProviderProps) => {
  const intl = useIntl();
  const { formatMessage } = intl;
  const localize = useLocalize();
  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId: string;
  };

  // Refs for chart capture
  const timelineRef = useRef<HTMLElement | null>(null);
  const demographicsRefs = useRef<Map<string, HTMLElement>>(new Map());

  // Phase data
  const { data: phase } = usePhase(phaseId);
  const participationMethod = phase?.data.attributes.participation_method;

  // Phase insights (metrics + demographics)
  const { data: insightsData } = usePhaseInsights({ phaseId });

  // Determine scope for analysis data (project-scoped for ideation/voting, phase-scoped for others)
  const analysisScope = getAnalysisScope(participationMethod);

  // Analysis and AI Summary data
  const { data: analyses } = useAnalyses({
    projectId: analysisScope === 'project' ? projectId : undefined,
    phaseId: analysisScope === 'phase' ? phaseId : undefined,
  });
  const analysisId = analyses?.data[0]?.id;

  const { data: insights } = useAnalysisInsights({
    analysisId: analysisId || '',
  });

  const summaryInsight = insights?.data.find(
    (insight) => insight.relationships.insightable.data.type === 'summary'
  );
  const summaryId = summaryInsight?.relationships.insightable.data.id;

  const { data: summaryData } = useAnalysisSummary({
    analysisId: analysisId || '',
    id: summaryId || '',
  });

  // Topic breakdown data
  const topicBreakdownData = useTopicBreakdownData({ phaseId });

  // Status breakdown data
  const { data: filterCounts } = useIdeasFilterCounts({
    phase: phaseId,
  });

  const { data: statuses } = useIdeaStatuses({
    queryParams: {
      participation_method: (participationMethod ||
        'ideation') as IdeaStatusParticipationMethod,
    },
    enabled: isIdeaBasedMethod(participationMethod),
  });

  // Most liked ideas/proposals
  const { data: ideasData } = useInfiniteIdeas({
    phase: phaseId,
    sort: 'popular',
    'page[size]': 5,
  });

  // Survey results (only for native_survey)
  const isSurvey = participationMethod === 'native_survey';
  const { data: surveyResultsData } = useSurveyResults({
    phaseId: isSurvey ? phaseId : null,
    filterLogicIds: [],
  });

  // Local state for download progress (set immediately when download starts)
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Download hook
  const { downloadWord: downloadWordDoc } = useInsightsWordDownload({
    filename,
    errorMessage: formatMessage(messages.errorWordDownload),
  });

  // Compute status breakdown data (only for idea-based methods)
  const statusBreakdown = useMemo(() => {
    if (!filterCounts || !statuses || !isIdeaBasedMethod(participationMethod)) {
      return undefined;
    }

    const countsByStatusId = filterCounts.data.attributes.idea_status_id;

    return statuses.data
      .filter((status) => {
        const count = countsByStatusId[status.id] || 0;
        return count > 0;
      })
      .map((status) => ({
        id: status.id,
        name: localize(status.attributes.title_multiloc),
        count: countsByStatusId[status.id] || 0,
        color: status.attributes.color,
        ordering: status.attributes.ordering,
      }))
      .sort((a, b) => a.ordering - b.ordering);
  }, [filterCounts, statuses, localize, participationMethod]);

  // Transform demographics
  const demographics = useMemo(() => {
    if (!insightsData) return undefined;

    const transformed = transformDemographicsResponse(
      insightsData.data.attributes.demographics,
      localize,
      formatMessage(messages.noDataAvailable)
    );

    return transformed.fields;
  }, [insightsData, localize, formatMessage]);

  // Ref registration functions
  const registerTimelineRef = useCallback((ref: HTMLElement | null) => {
    timelineRef.current = ref;
  }, []);

  const registerDemographicRef = useCallback(
    (fieldName: string, ref: HTMLElement | null) => {
      if (ref) {
        demographicsRefs.current.set(fieldName, ref);
      } else {
        demographicsRefs.current.delete(fieldName);
      }
    },
    []
  );

  // Capture charts and convert to images
  const captureCharts = useCallback(async () => {
    let timelineImage: Uint8Array | undefined;
    const demographicImages: Map<string, Uint8Array> = new Map();

    // Capture timeline chart (using html2canvas on container)
    if (timelineRef.current) {
      try {
        timelineImage = await htmlToImageBuffer(timelineRef.current, {
          scale: 2,
          backgroundColor: '#FFFFFF',
        });
      } catch (err) {
        console.error('Failed to capture timeline chart:', err);
      }
    }

    // Capture demographics charts (DIV-based)
    // Elements may be hidden with opacity: 0, so temporarily make them visible
    for (const [fieldName, element] of demographicsRefs.current.entries()) {
      try {
        // Store original styles
        const originalOpacity = element.style.opacity;
        const originalPointerEvents = element.style.pointerEvents;
        const parentElement = element.parentElement;
        const originalParentOpacity = parentElement?.style.opacity;
        const originalParentPointerEvents = parentElement?.style.pointerEvents;

        // Temporarily make visible for capture
        element.style.opacity = '1';
        element.style.pointerEvents = 'auto';
        if (parentElement) {
          parentElement.style.opacity = '1';
          parentElement.style.pointerEvents = 'auto';
        }

        const image = await htmlToImageBuffer(element, {
          scale: 2,
          backgroundColor: '#FFFFFF',
        });
        demographicImages.set(fieldName, image);

        // Restore original styles
        element.style.opacity = originalOpacity;
        element.style.pointerEvents = originalPointerEvents;
        if (parentElement) {
          parentElement.style.opacity = originalParentOpacity || '';
          parentElement.style.pointerEvents = originalParentPointerEvents || '';
        }
      } catch (err) {
        console.error(
          `Failed to capture demographic chart for ${fieldName}:`,
          err
        );
      }
    }

    return { timelineImage, demographicImages };
  }, []);

  // Download handler
  const downloadWord = useCallback(async () => {
    if (!phase || !insightsData) {
      return;
    }

    // Set loading state immediately
    setIsDownloading(true);
    setError(null);

    try {
      const phaseTitle = phase.data.attributes.title_multiloc;
      const phaseName = Object.values(phaseTitle)[0] || `Phase ${phaseId}`;

      // Capture chart images from visible components
      const { timelineImage, demographicImages } = await captureCharts();

      const data: InsightsWordData = {
        phaseName,
        metrics: insightsData.data.attributes.metrics,
        demographics,
        aiSummary: summaryData?.data.attributes.summary,
        topicBreakdown: {
          aiTopics: topicBreakdownData.aiTopics,
          manualTopics: topicBreakdownData.manualTopics,
        },
        statusBreakdown,
        mostLikedIdeas: ideasData?.pages[0]?.data,
        participationMethod,
        intl: {
          formatMessage: intl.formatMessage,
          locale: intl.locale,
          localize,
        },
        timelineImage,
        demographicImages,
        // Survey-specific data
        surveyResults: surveyResultsData?.data.attributes.results,
        surveyTotalSubmissions:
          surveyResultsData?.data.attributes.totalSubmissions,
      };

      await downloadWordDoc(data);
    } catch (err) {
      console.error('Word download error:', err);
      setError(formatMessage(messages.errorWordDownload));
    } finally {
      setIsDownloading(false);
    }
  }, [
    phase,
    phaseId,
    insightsData,
    demographics,
    summaryData,
    topicBreakdownData,
    statusBreakdown,
    ideasData,
    surveyResultsData,
    participationMethod,
    intl,
    localize,
    downloadWordDoc,
    captureCharts,
    formatMessage,
  ]);

  const contextValue = useMemo(
    () => ({
      downloadWord,
      isDownloading,
      error,
      registerTimelineRef,
      registerDemographicRef,
    }),
    [
      downloadWord,
      isDownloading,
      error,
      registerTimelineRef,
      registerDemographicRef,
    ]
  );

  return (
    <WordExportContext.Provider value={contextValue}>
      {children}
    </WordExportContext.Provider>
  );
};

export const useWordExportContext = () => useContext(WordExportContext);
