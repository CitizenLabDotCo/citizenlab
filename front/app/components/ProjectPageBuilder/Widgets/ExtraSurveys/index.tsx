import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { UserComponent, useEditor } from '@craftjs/core';

import usePhase from 'api/phases/usePhase';

import { maxPageWidth } from 'containers/ProjectsShowPage/styles';

import useCraftComponentDefaultPadding from 'components/admin/ContentBuilder/useCraftComponentDefaultPadding';

import messages from '../messages';

import ActionButton from './ActionButton';
import NoSurveySelected from './NoSurveySelected';
import Settings from './Settings';
import SurveyCard from './SurveyCard';
import { ExtraSurveysProps, isExtraSurveyPhase } from './utils';

const ExtraSurveysWidget: UserComponent<ExtraSurveysProps> = ({
  surveyPhaseId,
  buttonFormat = 'card',
  buttonStyle = 'primary',
  buttonText,
}) => {
  const { data: phase } = usePhase(surveyPhaseId);
  const padding = useCraftComponentDefaultPadding();
  const { enabled: inEditor } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  const survey =
    phase && isExtraSurveyPhase(phase.data) ? phase.data : undefined;

  if (!survey) {
    if (!inEditor) return null;

    return (
      <Box mx="auto" my="16px" maxWidth={`${maxPageWidth}px`} px={padding}>
        <NoSurveySelected />
      </Box>
    );
  }

  return (
    <Box
      id="e2e-extra-surveys-widget"
      mx="auto"
      my="16px"
      maxWidth={`${maxPageWidth}px`}
      px={padding}
    >
      {buttonFormat === 'card' ? (
        <SurveyCard
          phase={survey}
          buttonStyle={buttonStyle}
          buttonTextMultiloc={buttonText}
        />
      ) : (
        <ActionButton
          phase={survey}
          buttonStyle={buttonStyle}
          buttonTextMultiloc={buttonText}
        />
      )}
    </Box>
  );
};

ExtraSurveysWidget.craft = {
  related: {
    settings: Settings,
  },
  custom: {
    title: messages.extraSurveysWidgetTitle,
    noPointerEvents: true,
  },
};

export default ExtraSurveysWidget;
