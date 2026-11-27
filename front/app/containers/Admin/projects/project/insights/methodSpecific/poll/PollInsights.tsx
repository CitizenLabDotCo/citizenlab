import React from 'react';

import Skeleton from 'design-system/Skeleton';

import usePhaseInsights from 'api/phase_insights/usePhaseInsights';
import usePollQuestions from 'api/poll_questions/usePollQuestions';
import usePollResponses from 'api/poll_responses/usePollResponses';

import useProjectBackofficeRedesign from 'hooks/useProjectBackofficeRedesign';

import { usePdfExportContext } from '../../pdf/PdfExportContext';
import styles from '../shared/InputInsightsLayout.module.css';
import { MethodSpecificInsightProps } from '../types';

import PollQuestionCard from './PollQuestionCard';

// One result card per question, in the redesigned workspace only.
const PollInsights = ({ phaseId }: MethodSpecificInsightProps) => {
  const { isPdfRenderMode } = usePdfExportContext();
  const redesigned = useProjectBackofficeRedesign() && !isPdfRenderMode;
  const { data: insights } = usePhaseInsights({ phaseId });
  const { data: questions, isLoading } = usePollQuestions({
    phaseId,
    enabled: redesigned,
  });
  const { data: responses } = usePollResponses({
    phaseId: redesigned ? phaseId : null,
  });

  if (!redesigned) return null;

  if (isLoading || !responses) {
    return <Skeleton shape="block" height={160} />;
  }

  const counts = responses.data.attributes.series.options;
  const sortedQuestions = [...(questions?.data ?? [])].sort(
    (a, b) => a.attributes.ordering - b.attributes.ordering
  );

  // Every response answers each question, so a single choice question's
  // answers count the respondents, including those outside the phase dates.
  const singleChoiceTotals = sortedQuestions
    .filter((question) => question.attributes.question_type === 'single_option')
    .map((question) =>
      question.relationships.options.data.reduce(
        (total, option) => total + (counts[option.id] ?? 0),
        0
      )
    );
  const respondents = Math.max(
    insights?.data.attributes.metrics.poll?.responses ?? 0,
    ...singleChoiceTotals
  );

  return (
    <div className={styles.layout}>
      {sortedQuestions.map((question) => (
        <PollQuestionCard
          key={question.id}
          question={question}
          counts={counts}
          respondents={respondents}
        />
      ))}
    </div>
  );
};

export default PollInsights;
