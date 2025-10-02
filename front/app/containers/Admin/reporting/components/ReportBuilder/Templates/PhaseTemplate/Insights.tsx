import React from 'react';

import { Element } from '@craftjs/core';

import useAnalyses from 'api/analyses/useAnalyses';
import useAnalysisInsights from 'api/analysis_insights/useAnalysisInsights';
import useAnalysisSummary from 'api/analysis_summaries/useAnalysisSummary';

import { removeRefs } from 'containers/Admin/projects/project/analysis/Insights/util';

import Container from 'components/admin/ContentBuilder/Widgets/Container';

import TextMultiloc from '../../Widgets/TextMultiloc';

type SummaryProps = {
  summaryId: string;
  analysisId: string;
  selectedLocale: string;
};

const Summary = ({ summaryId, analysisId, selectedLocale }: SummaryProps) => {
  const { data: summary } = useAnalysisSummary({ id: summaryId, analysisId });
  if (!summary?.data.attributes.summary) return null;
  return (
    <Element is={Container} canvas id={summaryId}>
      <TextMultiloc
        text={{
          [selectedLocale]: `<p>${removeRefs(
            summary.data.attributes.summary
          ).replace(/(\r\n|\n|\r)/gm, '</p><p>')}</p>`,
        }}
      />
    </Element>
  );
};

type InsightsProps = {
  phaseId: string;
  questionId: string;
  selectedLocale: string;
};

const Insights = ({ phaseId, questionId, selectedLocale }: InsightsProps) => {
  const { data: analyses } = useAnalyses({ phaseId });
  const relevantAnalysis = analyses?.data.find(
    (analysis) =>
      analysis.relationships.main_custom_field?.data?.id === questionId
  );
  const { data: insights } = useAnalysisInsights({
    analysisId: relevantAnalysis?.id,
  });

  if (!insights || !relevantAnalysis) return null;
  // Only show the first insight in the template
  const firstInsight = insights.data[0];

  return (
    <div>
      <Summary
        summaryId={firstInsight.relationships.insightable.data.id}
        analysisId={relevantAnalysis.id}
        key={firstInsight.id}
        selectedLocale={selectedLocale}
      />
    </div>
  );
};

export default Insights;
