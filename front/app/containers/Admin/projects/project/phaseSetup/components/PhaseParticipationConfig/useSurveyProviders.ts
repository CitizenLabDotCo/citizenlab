import { TSurveyService } from 'api/phases/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

/** Which external survey tools this platform can embed. */
const useSurveyProviders = (): Record<TSurveyService, boolean> => {
  const typeform = useFeatureFlag({ name: 'typeform_surveys' });
  const googleForms = useFeatureFlag({ name: 'google_forms_surveys' });
  const surveyMonkey = useFeatureFlag({ name: 'surveymonkey_surveys' });
  const enalyzer = useFeatureFlag({ name: 'enalyzer_surveys' });
  const surveyXact = useFeatureFlag({ name: 'survey_xact_surveys' });
  const qualtrics = useFeatureFlag({ name: 'qualtrics_surveys' });
  const smartSurvey = useFeatureFlag({ name: 'smart_survey_surveys' });
  const snapSurvey = useFeatureFlag({ name: 'snap_survey_surveys' });
  const microsoftForms = useFeatureFlag({ name: 'microsoft_forms_surveys' });

  return {
    typeform,
    enalyzer,
    survey_xact: surveyXact,
    qualtrics,
    smart_survey: smartSurvey,
    microsoft_forms: microsoftForms,
    survey_monkey: surveyMonkey,
    snap_survey: snapSurvey,
    google_forms: googleForms,
  };
};

export default useSurveyProviders;
