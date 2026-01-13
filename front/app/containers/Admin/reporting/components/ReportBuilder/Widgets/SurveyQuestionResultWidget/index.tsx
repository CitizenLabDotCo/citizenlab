import React from 'react';

import useLocalize from 'hooks/useLocalize';

import PageBreakBox from 'components/admin/ContentBuilder/Widgets/PageBreakBox';

import NoData from '../_shared/NoData';
import { DescriptionText } from '../ChartWidgets/_shared/DescriptionText';
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
  ariaLabel,
  description,
}: Props) => {
  const localize = useLocalize();
  const hasEverything = projectId && phaseId && questionId;
  const projectOrPhaseEmptyMessage = getEmptyMessage({ projectId, phaseId });

  const descriptionId = `${React.useId()}-description`;
  const ariaDescribedBy = description ? descriptionId : undefined;
  const ariaLabelValue = ariaLabel ? localize(ariaLabel) : undefined;
  return (
    <PageBreakBox
      tabIndex={0}
      role="region"
      aria-label={ariaLabelValue}
      aria-describedby={ariaDescribedBy}
    >
      {hasEverything ? (
        <>
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
          <DescriptionText
            description={description}
            descriptionId={descriptionId}
          />
        </>
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
    ariaLabel: undefined,
    description: undefined,
  },
  related: {
    settings: Settings,
  },
};

export const surveyQuestionResultTitle = messages.surveyQuestion;

export default SurveyQuestionResultWidget;
