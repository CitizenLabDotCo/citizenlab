import React from 'react';

// Components
import { Box } from '@citizenlab/cl2-component-library';
import FormResultsQuestion from '../../../../../formBuilder/components/FormResults/FormResultsQuestion';
import { NoWidgetSettings } from 'components/admin/ContentBuilder/Widgets/NoWidgetSettings';

// Types
import { Locale, Multiloc } from '../../../../../../../typings';
import { Answer } from '../../../../../../../services/formCustomFields';

// i18n
import messages from './messages';

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
    <Box m="10px">
      <FormResultsQuestion
        locale={locale}
        question={question}
        inputType={inputType}
        answers={answers}
        totalResponses={totalResponses}
        required={required}
      />
    </Box>
  );
};

SurveyResultsQuestionWidget.craft = {
  props: {},
  related: {
    settings: NoWidgetSettings,
  },
  custom: {
    title: messages.surveyQuestion,
    noPointerEvents: true,
  },
};

export default SurveyResultsQuestionWidget;
