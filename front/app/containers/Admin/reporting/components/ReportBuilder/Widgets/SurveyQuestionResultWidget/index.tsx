import React from 'react';

// hooks
import useReportDefaultPadding from 'containers/Admin/reporting/hooks/useReportDefaultPadding';

// components
import PageBreakBox from 'components/admin/ContentBuilder/Widgets/PageBreakBox';
import NoData from '../_shared/NoData';
import SurveyQuestionResult from './SurveyQuestionResult';
import Settings from './Settings';

// i18n
import messages from './messages';

// utils
import { getEmptyMessage } from '../utils';

//  typings
import { Props } from './typings';

const SurveyQuestionResultWidget = ({ projectId, phaseId, fieldId }: Props) => {
  const px = useReportDefaultPadding();

  const projectOrPhaseEmptyMessage = getEmptyMessage({ projectId, phaseId });
  const emptyMessage =
    projectOrPhaseEmptyMessage ?? (!fieldId ? messages.emptyField : undefined);

  return (
    <PageBreakBox px={px}>
      {emptyMessage ? (
        <NoData message={emptyMessage} />
      ) : phaseId && fieldId ? (
        <SurveyQuestionResult phaseId={phaseId} fieldId={fieldId} />
      ) : (
        <></>
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

export const surveyQuestionResultTitle = messages.singleSurveyQuestion;

export default SurveyQuestionResultWidget;
