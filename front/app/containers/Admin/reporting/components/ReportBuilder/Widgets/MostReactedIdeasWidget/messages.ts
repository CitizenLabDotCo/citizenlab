import { defineMessages } from 'react-intl';

export default defineMessages({
  mostReactedIdeas: {
    id: 'app.containers.admin.ReportBuilder.MostReactedIdeasWidget.mostReactedIeas',
    defaultMessage: 'Most reacted ideas',
  },
  totalIdeas: {
    id: 'app.containers.admin.ReportBuilder.MostReactedIdeasWidget.totalIdeas',
    defaultMessage: 'Total ideas: {numberOfIdeas}',
  },
  numberOfIdeas: {
    id: 'app.containers.admin.ReportBuilder.MostReactedIdeasWidget.numberOfIdeas',
    defaultMessage: 'Number of ideas',
  },
  collapseLongText: {
    id: 'app.containers.admin.ReportBuilder.MostReactedIdeasWidget.collapseLongText',
    defaultMessage: 'Collapse long text',
  },
  showMore: {
    id: 'app.containers.admin.ReportBuilder.MostReactedIdeasWidget.showMore',
    defaultMessage: 'Show more',
  },
  title: {
    id: 'app.containers.admin.ReportBuilder.MostReactedIdeasWidget.title',
    defaultMessage: 'Title',
  },
  ideationPhases: {
    id: 'app.containers.admin.ReportBuilder.MostReactedIdeasWidget.ideationPhases',
    defaultMessage: 'Ideation phases',
  },
  noProjectSelected: {
    id: 'app.containers.admin.ReportBuilder.MostReactedIdeasWidget.noProjectSelected',
    defaultMessage:
      'No project was selected. Please select a project to see the most reacted ideas.',
  },
  noIdeasAvailable: {
    id: 'app.containers.admin.ReportBuilder.MostReactedIdeasWidget.noIdeasAvailable',
    defaultMessage:
      'There are no questions available for this project or phase.',
  },
});
