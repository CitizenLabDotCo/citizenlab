import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { Element } from '@craftjs/core';

import useRawCustomFields from 'api/custom_fields/useRawCustomFields';
import usePhase from 'api/phases/usePhase';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';

import { WIDGET_TITLES } from 'containers/Admin/reporting/components/ReportBuilder/Widgets';
import { createMultiloc } from 'containers/Admin/reporting/utils/multiloc';

import Container from 'components/admin/ContentBuilder/Widgets/Container';
import WhiteSpace from 'components/admin/ContentBuilder/Widgets/WhiteSpace';

import { MessageDescriptor, useFormatMessageWithLocale } from 'utils/cl-intl';
import { withoutSpacing } from 'utils/textUtils';

import MostReactedIdeasWidget from '../../Widgets/MostReactedIdeasWidget';
import SurveyQuestionResultWidget from '../../Widgets/SurveyQuestionResultWidget';
import TextMultiloc from '../../Widgets/TextMultiloc';
import { SUPPORTED_INPUT_TYPES } from '../constants';

import messages from './messages';

interface Props {
  phaseId: string;
}

const PhaseTemplate = ({ phaseId }: Props) => {
  const formatMessageWithLocale = useFormatMessageWithLocale();
  const appConfigurationLocales = useAppConfigurationLocales();
  const { data: phase } = usePhase(phaseId);
  const participationMethod = phase?.data.attributes.participation_method;

  const { data: surveyQuestions } = useRawCustomFields({
    phaseId: participationMethod === 'native_survey' ? phaseId : undefined,
  });

  if (!phase || !appConfigurationLocales) return null;

  const projectId = phase.data.relationships.project.data.id;

  const filteredSurveyQuestions = surveyQuestions
    ? surveyQuestions.data.filter((field) =>
        SUPPORTED_INPUT_TYPES.has(field.attributes.input_type)
      )
    : undefined;

  if (participationMethod === 'native_survey' && !filteredSurveyQuestions) {
    return null;
  }

  const toMultilocParagraph = (
    title: MessageDescriptor,
    text: MessageDescriptor
  ) => {
    return createMultiloc(appConfigurationLocales, (locale) => {
      return withoutSpacing`
          <h3>${formatMessageWithLocale(locale, title)}</h3>
          <p>${formatMessageWithLocale(locale, text)}</p>
        `;
    });
  };

  const toMultiloc = (message: MessageDescriptor) => {
    return createMultiloc(appConfigurationLocales, (locale) => {
      return formatMessageWithLocale(locale, message);
    });
  };

  return (
    <Element id="phase-report-template" is={Box} canvas>
      <TextMultiloc
        text={toMultilocParagraph(
          messages.phaseReport,
          messages.phaseReportDescription
        )}
      />

      <WhiteSpace />
      {filteredSurveyQuestions?.map((question) => (
        <Element is={Container} canvas key={question.id}>
          <SurveyQuestionResultWidget
            projectId={projectId}
            phaseId={phaseId}
            questionId={question.id}
          />
          <WhiteSpace />
        </Element>
      ))}
      {participationMethod === 'ideation' && (
        <MostReactedIdeasWidget
          title={toMultiloc(WIDGET_TITLES.MostReactedIdeasWidget)}
          projectId={projectId}
          phaseId={phaseId}
          numberOfIdeas={5}
          collapseLongText={false}
        />
      )}
    </Element>
  );
};

export default PhaseTemplate;
