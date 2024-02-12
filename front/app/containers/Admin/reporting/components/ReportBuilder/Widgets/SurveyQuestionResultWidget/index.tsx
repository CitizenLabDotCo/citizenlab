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

const SurveyQuestionResultWidget = ({ projectId, phaseId, fieldId }: Props) => {
  const px = useReportDefaultPadding();

  const hasEverything = projectId && phaseId && fieldId;

  const projectOrPhaseEmptyMessage = getEmptyMessage({ projectId, phaseId });

  return (
    <PageBreakBox px={px}>
      {hasEverything ? (
        <SurveyQuestionResult
          projectId={projectId}
          phaseId={phaseId}
          fieldId={fieldId}
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
    fieldId: undefined,
  },
  related: {
    settings: Settings,
  },
};

export const surveyQuestionResultTitle = messages.surveyQuestion;

export default SurveyQuestionResultWidget;
