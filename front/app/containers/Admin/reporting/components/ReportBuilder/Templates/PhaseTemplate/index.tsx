import React, { useContext, useEffect, useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { Element } from '@craftjs/core';

import useAnalyses from 'api/analyses/useAnalyses';
import useAnalysisInsights from 'api/analysis_insights/useAnalysisInsights';
import useAnalysisSummary from 'api/analysis_summaries/useAnalysisSummary';
import useRawCustomFields from 'api/custom_fields/useRawCustomFields';
import usePhase from 'api/phases/usePhase';

import useAppConfigurationLocales, {
  createMultiloc,
} from 'hooks/useAppConfigurationLocales';

import { removeRefs } from 'containers/Admin/projects/project/analysis/Insights/util';
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
interface Props {
  phaseId: string;
  selectedLocale: string;
  summaries: { [key: string]: any };
}

const PhaseTemplateContent = ({
  phaseId,
  selectedLocale,
  summaries,
}: Props) => {
  console.log({ summaries });
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

const PhaseTemplate = ({ phaseId, selectedLocale }: Props) => {
  const [summaries, setSummaries] = useState<{ [key: string]: any }>({});
  const [summariesLoaded, setSummariesLoaded] = useState(false);
  const enabled = useContext(TemplateContext);
  if (!summariesLoaded) {
    return (
      <PrefetchSummaries
        phaseId={phaseId}
        setSummaries={setSummaries}
        setSummariesLoaded={setSummariesLoaded}
      />
    );
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

const PrefetchSummaries = ({
  phaseId,
  setSummaries,
  setSummariesLoaded,
}: {
  phaseId: string;
  setSummaries: React.Dispatch<React.SetStateAction<any[]>>;
  setSummariesLoaded: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { data: phase } = usePhase(phaseId);
  const { data: surveyQuestions } = useRawCustomFields({
    phaseId:
      phase?.data.attributes.participation_method === 'native_survey'
        ? phaseId
        : undefined,
  });

  const questionIds =
    surveyQuestions?.data
      .filter((field) =>
        SURVEY_QUESTION_INPUT_TYPES.has(field.attributes.input_type)
      )
      .map((field) => field.id) || [];

  const { data: analyses } = useAnalyses({ phaseId });
  const relevantAnalyses = analyses?.data.filter((analysis) =>
    questionIds.includes(
      analysis.relationships.main_custom_field?.data?.id || ''
    )
  );

  useEffect(() => {
    if (relevantAnalyses && relevantAnalyses.length === 0) {
      setSummariesLoaded(true);
    }
  }, [relevantAnalyses, setSummariesLoaded]);

  return (
    <>
      {relevantAnalyses?.map((analysis) => (
        <InsightsNew
          key={analysis.id}
          analysisId={analysis.id}
          questionId={analysis.relationships.main_custom_field?.data?.id}
          setSummaries={setSummaries}
          setSummariesLoaded={setSummariesLoaded}
        />
      ))}
    </>
  );
};

const InsightsNew = ({
  analysisId,
  questionId,
  setSummaries,
  setSummariesLoaded,
}) => {
  const { data: insights } = useAnalysisInsights({
    analysisId,
  });

  const summaryId = insights?.data[0].relationships.insightable.data.id;
  const { data: summary, isLoading } = useAnalysisSummary({
    id: summaryId,
    analysisId,
  });

  useEffect(() => {
    if (summary) {
      setSummaries((prev) => ({
        ...prev,
        [questionId]: `<p>${removeRefs(
          summary.data.attributes.summary || ''
        ).replace(/(\r\n|\n|\r)/gm, '</p><p>')}</p>`,
      }));
    }
    setSummariesLoaded(!isLoading);
  }, [summary, questionId, setSummaries, setSummariesLoaded, isLoading]);
  return <></>;
};
