import React from 'react';

// components
import Card from '../_shared/Card';
import NoData from '../_shared/NoData';
import SurveyQuestionResult from './SurveyQuestionResult';
import Settings from './Settings';

// utils
import { getEmptyMessage } from '../utils';

//  typings
import { Props } from './typings';

const SurveyQuestionResultWidget = ({
  title,
  projectId,
  phaseId,
  fieldId,
}: Props) => {
  const emptyMessage = getEmptyMessage({ projectId, phaseId });

  return (
    <Card title={title} data-testid="survey-question-result-widget">
      {emptyMessage ? (
        <NoData message={emptyMessage} />
      ) : phaseId && fieldId ? (
        <SurveyQuestionResult phaseId={phaseId} fieldId={fieldId} />
      ) : (
        <></>
      )}
    </Card>
  );
};

SurveyQuestionResultWidget.craft = {
  props: {
    title: {},
    projectId: undefined,
    phaseId: undefined,
    fieldId: undefined,
  },
  related: {
    settings: Settings,
  },
};

export default SurveyQuestionResultWidget;
