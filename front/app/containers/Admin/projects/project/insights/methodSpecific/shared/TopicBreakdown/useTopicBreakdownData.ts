import { useMemo } from 'react';

import { useParams } from 'react-router-dom';

import useAnalyses from 'api/analyses/useAnalyses';
import useAnalysisTags from 'api/analysis_tags/useAnalysisTags';
import useIdeasFilterCounts from 'api/ideas_filter_counts/useIdeasFilterCounts';
import useInputTopics from 'api/input_topics/useInputTopics';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocalize from 'hooks/useLocalize';

export interface TopicData {
  id: string;
  name: string;
  count: number;
  percentage: number;
}

interface UseTopicBreakdownDataProps {
  phaseId: string;
}

const useTopicBreakdownData = ({ phaseId }: UseTopicBreakdownDataProps) => {
  const localize = useLocalize();
  const { projectId } = useParams() as { projectId: string };

  const isAiTopicsAllowed = useFeatureFlag({
    name: 'large_summaries',
    onlyCheckAllowed: true,
  });

  // 1. Fetch Analysis (to get analysisId)
  const {
    data: analyses,
    isLoading: isLoadingAnalyses,
    error: errorAnalyses,
  } = useAnalyses({
    projectId,
    phaseId,
  });

  const analysisId = analyses?.data[0].id;

  // 2. Fetch AI Topics (Dependent on analysisId)
  const {
    data: tags,
    isLoading: isLoadingTags,
    error: errorTags,
  } = useAnalysisTags({
    analysisId: analysisId || '',
  });

  // 3. Fetch Manual Topic Data
  const {
    data: filterCounts,
    isLoading: isLoadingCounts,
    error: errorCounts,
  } = useIdeasFilterCounts({
    phase: phaseId,
  });

  const {
    data: topics,
    isLoading: isLoadingTopics,
    error: errorTopics,
  } = useInputTopics(projectId);

  const aiTopics = useMemo((): TopicData[] => {
    if (!tags?.data || !isAiTopicsAllowed) return [];

    const nlpTopics = tags.data.filter(
      (tag) => tag.attributes.tag_type === 'nlp_topic'
    );

    const totalTopicCount = nlpTopics.reduce(
      (sum, tag) => sum + tag.attributes.total_input_count,
      0
    );

    // Sort a copy to avoid mutating the original query cache
    return [...nlpTopics]
      .sort(
        (a, b) =>
          b.attributes.total_input_count - a.attributes.total_input_count
      )
      .map((tag) => ({
        id: tag.id,
        name: tag.attributes.name,
        count: tag.attributes.total_input_count,
        percentage:
          totalTopicCount > 0
            ? Math.round(
                (tag.attributes.total_input_count / totalTopicCount) * 100
              )
            : 0,
      }));
  }, [tags, isAiTopicsAllowed]);

  const manualTopics = useMemo((): TopicData[] => {
    if (!filterCounts?.data || !topics?.data) return [];

    const countsByTopicId = filterCounts.data.attributes.input_topic_id;
    const totalIdeas = filterCounts.data.attributes.total || 0;

    return topics.data
      .filter((topic) => (countsByTopicId[topic.id] || 0) > 0)
      .map((topic) => {
        const count = countsByTopicId[topic.id] || 0;
        return {
          id: topic.id,
          name: localize(topic.attributes.title_multiloc),
          count,
          percentage:
            totalIdeas > 0 ? Math.round((count / totalIdeas) * 100) : 0,
        };
      })
      .sort((a, b) => b.count - a.count);
  }, [filterCounts, topics, localize]);

  const totalInputs = filterCounts?.data.attributes.total || 0;

  const aggregates = useMemo(() => {
    return {
      maxAiTopicCount:
        aiTopics.length > 0 ? Math.max(...aiTopics.map((t) => t.count)) : 0,
      maxManualTopicCount:
        manualTopics.length > 0
          ? Math.max(...manualTopics.map((t) => t.count))
          : 0,
    };
  }, [aiTopics, manualTopics]);

  return {
    isAiTopicsAllowed,
    aiTopics,
    manualTopics,
    totalInputs,
    ...aggregates,
    isLoading:
      isLoadingAnalyses || isLoadingTags || isLoadingCounts || isLoadingTopics,
    hasError: !!(errorAnalyses || errorTags || errorCounts || errorTopics),
  };
};

export default useTopicBreakdownData;
