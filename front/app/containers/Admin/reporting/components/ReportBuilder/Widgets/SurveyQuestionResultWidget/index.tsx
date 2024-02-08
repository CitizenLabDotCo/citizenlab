import React from 'react';

// hooks
import useReportDefaultPadding from 'containers/Admin/reporting/hooks/useReportDefaultPadding';

// components
import PageBreakBox from 'components/admin/ContentBuilder/Widgets/PageBreakBox';
import NoData from '../_shared/NoData';
import SurveyQuestionResult from './Question';
import Settings from './Settings';

// i18n
import messages from './messages';

// utils
import { getEmptyMessage } from '../utils';

//  typings
import { Props } from './typings';

const SurveyQuestionResultWidget = ({
  projectId,
  phaseId,
  questionId,
  groupByUserFieldId,
}: Props) => {
  const px = useReportDefaultPadding();

  const hasEverything = projectId && phaseId && questionId;

  const projectOrPhaseEmptyMessage = getEmptyMessage({ projectId, phaseId });

  const emptyMessage = hasEverything
    ? undefined
    : projectOrPhaseEmptyMessage ?? messages.emptyField;

  return (
    <PageBreakBox px={px}>
      {emptyMessage ? (
        <NoData message={emptyMessage} />
      ) : hasEverything ? (
        <SurveyQuestionResult
          projectId={projectId}
          phaseId={phaseId}
          questionId={questionId}
          groupByUserFieldId={groupByUserFieldId}
        />
      ) : (
        // This is unreachable but I can't seem to explain to TS
        // that the emptyMessage check is enough to guarantee that
        <></>
      )}
    </PageBreakBox>
  );
};

SurveyQuestionResultWidget.craft = {
  props: {
    projectId: undefined,
    phaseId: undefined,
    questionId: undefined,
  },
  related: {
    settings: Settings,
  },
};

export const surveyQuestionResultTitle = messages.singleSurveyQuestion;

export default SurveyQuestionResultWidget;
