import { defineMessages } from 'react-intl';

export default defineMessages({
  title: {
    id: 'app.containers.Admin.reporting.components.ReportBuilder.ChatPanel.title',
    defaultMessage: 'Ask for changes',
  },
  emptyState: {
    id: 'app.containers.Admin.reporting.components.ReportBuilder.ChatPanel.emptyState',
    defaultMessage:
      'Ask for a change to this report. For example: make the summary shorter, or add a chart of participation by age.',
  },
  placeholder: {
    id: 'app.containers.Admin.reporting.components.ReportBuilder.ChatPanel.placeholder',
    defaultMessage: 'What would you like to change?',
  },
  send: {
    id: 'app.containers.Admin.reporting.components.ReportBuilder.ChatPanel.send',
    defaultMessage: 'Send',
  },
  working: {
    id: 'app.containers.Admin.reporting.components.ReportBuilder.ChatPanel.working',
    defaultMessage: 'Working on it. This can take a minute.',
  },
});
