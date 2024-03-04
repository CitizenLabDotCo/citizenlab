import React from 'react';

import useReportDefaultPadding from 'containers/Admin/reporting/hooks/useReportDefaultPadding';

import PageBreakBox from 'components/admin/ContentBuilder/Widgets/PageBreakBox';

import NoData from '../_shared/NoData';
import { getEmptyMessage } from '../utils';

import messages from './messages';
import Question from './Question';
import Settings from './Settings';

//  typings
import { Props } from './typings';

const SurveyQuestionResultWidget = ({
  projectId,
  phaseId,
  questionId,
  groupMode,
  groupFieldId,
}: Props) => {
  const px = useReportDefaultPadding();
  const hasEverything = projectId && phaseId && questionId;
  const projectOrPhaseEmptyMessage = getEmptyMessage({ projectId, phaseId });

  return (
    <PageBreakBox px={px}>
      {hasEverything ? (
        <Question
          projectId={projectId}
          phaseId={phaseId}
          questionId={questionId}
          groupMode={groupFieldId ? groupMode : undefined}
          groupFieldId={groupFieldId}
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
  },
  related: {
    settings: Settings,
  },
};

export const surveyQuestionResultTitle = messages.surveyQuestion;

export default SurveyQuestionResultWidget;
