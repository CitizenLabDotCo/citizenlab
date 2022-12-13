import React from 'react';
import FormResultsQuestion from '../../../../../formBuilder/components/FormResults/FormResultsQuestion';
import { Locale, Multiloc } from '../../../../../../../typings';
import { Answer } from '../../../../../../../services/formCustomFields';

type SurveyResultsQuestionProps = {
  locale: Locale;
  question: Multiloc;
  inputType: string;
  answers: Answer[];
  totalResponses: number;
  required: boolean;
};

const SurveyResultsQuestionWidget = ({
  locale,
  question,
  inputType,
  answers,
  totalResponses,
  required,
}: SurveyResultsQuestionProps) => {
  return (
    <FormResultsQuestion
      locale={locale}
      question={question}
      inputType={inputType}
      answers={answers}
      totalResponses={totalResponses}
      required={required}
    />
  );
};

// SurveyResultsWidget.craft = {
//   props: {
//     title: undefined,
//     projectId: undefined,
//     phaseId: undefined,
//   },
//   related: {
//     settings: SurveyResultsWidgetSettings,
//   },
//   custom: {
//     title: messages.surveyResults,
//     noPointerEvents: true,
//   },
// };

export default SurveyResultsQuestionWidget;
