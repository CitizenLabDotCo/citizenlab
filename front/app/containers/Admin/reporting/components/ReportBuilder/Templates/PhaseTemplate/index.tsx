import React, { useContext } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { Element } from '@craftjs/core';

import useRawCustomFields from 'api/custom_fields/useRawCustomFields';
import usePhase from 'api/phases/usePhase';

import useAppConfigurationLocales, {
  createMultiloc,
} from 'hooks/useAppConfigurationLocales';

import { WIDGET_TITLES } from 'containers/Admin/reporting/components/ReportBuilder/Widgets';

import Container from 'components/admin/ContentBuilder/Widgets/Container';
import WhiteSpace from 'components/admin/ContentBuilder/Widgets/WhiteSpace';

import { MessageDescriptor, useFormatMessageWithLocale } from 'utils/cl-intl';
import { withoutSpacing } from 'utils/textUtils';

import { SURVEY_QUESTION_INPUT_TYPES } from '../../constants';
import MostReactedIdeasWidget from '../../Widgets/MostReactedIdeasWidget';
import SurveyQuestionResultWidget from '../../Widgets/SurveyQuestionResultWidget';
import TextMultiloc from '../../Widgets/TextMultiloc';
import { TemplateContext } from '../context';

import messages from './messages';
import usePrefetchSummaries from './usePrefetchSummaries';

interface PhaseTemplateContentProps {
  phaseId: string;
  selectedLocale: string;
  summaries: Record<string, string>;
}

interface PhaseTemplateProps {
  phaseId: string;
  selectedLocale: string;
}

const PhaseTemplateContent = ({
  phaseId,
  selectedLocale,
  summaries,
}: PhaseTemplateContentProps) => {
  const formatMessageWithLocale = useFormatMessageWithLocale();
  const appConfigurationLocales = useAppConfigurationLocales();
  const { data: phase } = usePhase(phaseId);
  const participationMethod = phase?.data.attributes.participation_method;

  const { data: surveyQuestions } = useRawCustomFields({
    phaseId: participationMethod === 'native_survey' ? phaseId : undefined,
  });

  if (!phase || !appConfigurationLocales) return null;
  if (!formatMessageWithLocale) return null;

  const projectId = phase.data.relationships.project.data.id;

  const filteredSurveyQuestions = surveyQuestions
    ? surveyQuestions.data.filter((field) =>
        SURVEY_QUESTION_INPUT_TYPES.has(field.attributes.input_type)
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
          <TextMultiloc
            text={{
              [selectedLocale]: summaries[question.id],
            }}
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

const PhaseTemplate = ({ phaseId, selectedLocale }: PhaseTemplateProps) => {
  const { summaries, summariesReady } = usePrefetchSummaries({ phaseId });
  const enabled = useContext(TemplateContext);

  if (!summariesReady) {
    return null;
  }

  if (enabled) {
    return (
      <>
        <PhaseTemplateContent
          summaries={summaries}
          phaseId={phaseId}
          selectedLocale={selectedLocale}
        />
      </>
    );
  } else {
    return <Element id="phase-report-template" is={Box} canvas />;
  }
};

export default PhaseTemplate;
