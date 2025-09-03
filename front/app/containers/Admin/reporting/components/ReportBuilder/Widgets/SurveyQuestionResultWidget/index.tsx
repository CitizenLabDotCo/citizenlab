import React from 'react';

import PageBreakBox from 'components/admin/ContentBuilder/Widgets/PageBreakBox';

import NoData from '../_shared/NoData';
import { getEmptyMessage } from '../utils';

import messages from './messages';
import Question from './Question';
import Settings from './Settings';
import { Props } from './typings';

const SurveyQuestionResultWidget = ({
  projectId,
  phaseId,
  questionId,
  groupMode,
  groupFieldId,
  heatmap,
  year,
  quarter,
}: Props) => {
  const hasEverything = projectId && phaseId && questionId;
  const projectOrPhaseEmptyMessage = getEmptyMessage({ projectId, phaseId });

  return (
    <PageBreakBox>
      {hasEverything ? (
        <Question
          projectId={projectId}
          phaseId={phaseId}
          questionId={questionId}
          groupMode={groupFieldId ? groupMode : undefined}
          groupFieldId={groupFieldId}
          heatmap={heatmap}
          year={year}
          quarter={quarter}
        />
      ) : (
        <NoData message={projectOrPhaseEmptyMessage ?? messages.emptyField} />
      )}
    </PageBreakBox>
  );
};

SurveyQuestionResultWidget.craft = {
  props: {
    projectId: undefined,
    phaseId: undefined,
    questionId: undefined,
    groupMode: undefined,
    groupFieldId: undefined,
    heatmap: undefined,
  },
  related: {
    settings: Settings,
  },
};

export const surveyQuestionResultTitle = messages.surveyQuestion;

export default SurveyQuestionResultWidget;
