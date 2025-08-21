import { defineMessages } from 'react-intl';

export default defineMessages({
  inputAssignmentSectionTitle: {
    id: 'app.containers.AdminPage.ProjectEdit.inputAssignmentSectionTitle',
    defaultMessage: 'Who is responsible for processing the inputs?',
  },
  inputAssignmentTooltipText: {
    id: 'app.containers.AdminPage.ProjectEdit.inputAssignmentTooltipText2',
    defaultMessage:
      'All new inputs in this project will be assigned to this person. The assignee can be changed in the {globalInputManagerLink} or the input manager at the phase-level (ideation and proposal phases only).',
  },
  globalInputManagerLinkText: {
    id: 'app.containers.AdminPage.ProjectEdit.globalInputManagerLinkText',
    defaultMessage: 'global input manager',
  },
});
