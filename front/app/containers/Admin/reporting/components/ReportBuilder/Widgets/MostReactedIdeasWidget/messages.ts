import { defineMessages } from 'react-intl';

export default defineMessages({
  mostReactedIdeas: {
    id: 'app.containers.admin.ReportBuilder.MostReactedIdeasWidget.mostReactedIdeas',
    defaultMessage: 'Most reacted ideas',
  },
  totalIdeas: {
    id: 'app.containers.admin.ReportBuilder.MostVotedIdeasWidget.totalIdeas',
    defaultMessage: 'Total ideas: {numberOfIdeas}',
  },
  numberOfIdeas: {
    id: 'app.containers.admin.ReportBuilder.MostVotedIdeasWidget.numberOfIdeas',
    defaultMessage: 'Number of ideas',
  },
  collapseLongText: {
    id: 'app.containers.admin.ReportBuilder.MostVotedIdeasWidget.collapseLongText',
    defaultMessage: 'Collapse long text',
  },
  showMore: {
    id: 'app.containers.admin.ReportBuilder.MostVotedIdeasWidget.showMore',
    defaultMessage: 'Show more',
  },
  title: {
    id: 'app.containers.admin.ReportBuilder.MostVotedIdeasWidget.title',
    defaultMessage: 'Title',
  },
  ideationPhases: {
    id: 'app.containers.admin.ReportBuilder.MostVotedIdeasWidget.ideationPhases',
    defaultMessage: 'Ideation phases',
  },
  noProjectSelected: {
    id: 'app.containers.admin.ReportBuilder.MostVotedIdeasWidget.noProjectSelected',
    defaultMessage:
      'No project was selected. Please select a project to see the most reacted ideas.',
  },
  noIdeasAvailable: {
    id: 'app.containers.admin.ReportBuilder.MostVotedIdeasWidget.noIdeasAvailable',
    defaultMessage:
      'There are no questions available for this project or phase.',
  },
});
