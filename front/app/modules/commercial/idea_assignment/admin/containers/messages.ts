import { defineMessages } from 'react-intl';

export default defineMessages({
  inputAssignmentSectionTitle: {
    id: 'app.containers.AdminPage.ProjectEdit.inputAssignmentSectionTitle',
    defaultMessage: 'Who is responsible for processing the inputs?',
  },
  inputAssignmentTooltipText: {
    id: 'app.containers.AdminPage.ProjectEdit.inputAssignmentTooltipText',
    defaultMessage:
      'All new inputs in this project will be assigned to this person. The assignee can be changed in the {ideaManagerLink}.',
  },
  inputManagerLinkText: {
    id: 'app.containers.AdminPage.ProjectEdit.inputManagerLinkText',
    defaultMessage: 'input manager',
  },
});
