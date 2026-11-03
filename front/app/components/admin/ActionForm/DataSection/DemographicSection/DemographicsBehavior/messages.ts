import { defineMessages } from 'react-intl';

export default defineMessages({
  whichQuestions: {
    id: 'app.components.admin.ActionForm.DataSection.DemographicSection.DemographicsBehavior.whichQuestions',
    defaultMessage: 'Which questions to ask',
  },
  global: {
    id: 'app.components.admin.ActionForm.DataSection.DemographicSection.DemographicsBehavior.global',
    defaultMessage: 'Use platform-wide demographic questions',
  },
  disabled: {
    id: 'app.components.admin.ActionForm.DataSection.DemographicSection.DemographicsBehavior.disabled',
    defaultMessage: "Don't ask demographic questions",
  },
  custom: {
    id: 'app.components.admin.ActionForm.DataSection.DemographicSection.DemographicsBehavior.custom',
    defaultMessage: 'Customize which demographic questions should be asked',
  },
});
