import { defineMessages } from 'react-intl';

export default defineMessages({
  header: {
    id: 'app.containers.Projects.header',
    defaultMessage: 'Projects',
  },
  editProject: {
    id: 'app.containers.Projects.editProject',
    defaultMessage: 'Edit project',
  },
  project: {
    id: 'app.containers.Projects.project',
    defaultMessage: 'Project',
  },
  a11y_titleInputs: {
    id: 'app.containers.Projects.a11y_titleInputs',
    defaultMessage: 'All inputs submitted to this project',
  },
  a11y_titleInputsPhase: {
    id: 'app.containers.Projects.a11y_titleInputsPhase',
    defaultMessage: 'All inputs submitted to this phase',
  },
  invisibleTitleSurvey: {
    id: 'app.containers.Projects.invisibleTitleSurvey',
    defaultMessage: 'Take the survey',
  },
  invisibleTitlePoll: {
    id: 'app.containers.Projects.invisibleTitlePoll',
    defaultMessage: 'Take the poll',
  },
  invisibleTitlePhaseAbout: {
    id: 'app.containers.Projects.invisibleTitlePhaseAbout',
    defaultMessage: 'About this phase',
  },
  information: {
    id: 'app.containers.Projects.information',
    defaultMessage: 'Information',
  },
  events: {
    id: 'app.containers.Projects.events',
    defaultMessage: 'Events',
  },
  metaTitle: {
    id: 'app.containers.Projects.metaTitle',
    defaultMessage: 'Project: {projectTitle}',
  },
  upcomingEvents: {
    id: 'app.containers.Projects.upcomingEvents',
    defaultMessage: 'Upcoming events',
  },
  location: {
    id: 'app.containers.Projects.location',
    defaultMessage: 'Location:',
  },
  noPhaseSelected: {
    id: 'app.containers.Projects.noPhaseSelected',
    defaultMessage: 'No phase selected',
  },
  endedOn: {
    id: 'app.containers.Projects.endedOn',
    defaultMessage: 'Ended on {date}',
  },
  previousPhase: {
    id: 'app.containers.Projects.previousPhase',
    defaultMessage: 'Previous phase',
  },
  nextPhase: {
    id: 'app.containers.Projects.nextPhase',
    defaultMessage: 'Next phase',
  },
  currentPhase: {
    id: 'app.containers.Projects.currentPhase',
    defaultMessage: 'Current phase',
  },
  navPoll: {
    id: 'app.containers.Projects.navPoll',
    defaultMessage: 'Poll',
  },
  navSurvey: {
    id: 'app.containers.Projects.navSurvey',
    defaultMessage: 'Survey',
  },
  noProjectFoundHere: {
    id: 'app.containers.Projects.noProjectFoundHere',
    defaultMessage: 'There is no project here.',
  },
  thisProjectIsNotVisibleToYou: {
    id: 'app.containers.Projects.thisProjectIsNotVisibleToYou',
    defaultMessage: 'This project is not visible to you.',
  },
  goBackToList: {
    id: 'app.containers.Projects.goBackToList',
    defaultMessage: 'Go to the projects overview',
  },
  archived: {
    id: 'app.containers.Projects.archived',
    defaultMessage: 'Archived',
  },
  myExpenses: {
    id: 'app.containers.Projects.myExpenses',
    defaultMessage: 'My expenses',
  },
  budgetValidated: {
    id: 'app.containers.Projects.budgetValidated',
    defaultMessage: 'Expenses validated, congratulations!',
  },
  budgetExceeded: {
    id: 'app.containers.Projects.budgetExceeded',
    defaultMessage: 'Your expenses exceed the total assignable budget',
  },
  totalBudget: {
    id: 'app.containers.Projects.totalBudget',
    defaultMessage: 'Total budget',
  },
  spentBudget: {
    id: 'app.containers.Projects.spentBudget',
    defaultMessage: 'Spent budget',
  },
  manageBudget: {
    id: 'app.containers.Projects.manageBudget',
    defaultMessage: 'Manage budget',
  },
  submitMyExpenses: {
    id: 'app.containers.Projects.submitMyExpenses',
    defaultMessage: 'Submit my expenses',
  },
  noExpenses: {
    id: 'app.containers.Projects.noExpenses',
    defaultMessage: "You don't have any expenses yet",
  },
  removeItem: {
    id: 'app.containers.Projects.removeItem',
    defaultMessage: 'Remove item',
  },
  a11y_phaseX: {
    id: 'app.containers.Projects.a11y_phase',
    defaultMessage: 'Phase {phaseNumber}: {phaseTitle}',
  },
  a11y_phasesOverview: {
    id: 'app.containers.Projects.a11y_phasesOverview',
    defaultMessage: 'Phases overview',
  },
  a11y_selectedPhaseX: {
    id: 'app.containers.Projects.a11y_selectedPhaseX',
    defaultMessage:
      'Selected phase. Phase {selectedPhaseNumber}: {selectedPhaseTitle}',
  },
  projectTwitterMessage: {
    id: 'app.containers.Projects.projectTwitterMessage',
    defaultMessage:
      'Make your voice heard! Participate in {projectName} | {orgName}',
  },
  whatsAppMessage: {
    id: 'app.containers.Projects.whatsAppMessage',
    defaultMessage:
      '{projectName} | from the participation platform of {orgName}',
  },
  about: {
    id: 'app.containers.Projects.about',
    defaultMessage: 'About',
  },
  xIdeas: {
    id: 'app.containers.Projects.xIdeas',
    defaultMessage:
      '{ideasCount, plural, no {# ideas} one {# idea} other {# ideas}}',
  },
  xIdeasInCurrentPhase: {
    id: 'app.containers.Projects.xIdeasInCurrentPhase',
    defaultMessage:
      '{ideasCount, plural, no {# ideas} one {# idea} other {# ideas}} in the current phase',
  },
  xIdeasInFinalPhase: {
    id: 'app.containers.Projects.xIdeasInFinalPhase',
    defaultMessage:
      '{ideasCount, plural, no {# ideas} one {# idea} other {# ideas}} in the final phase',
  },
  xContributions: {
    id: 'app.containers.Projects.xContributions',
    defaultMessage:
      '{ideasCount, plural, no {# contributions} one {# contribution} other {# contributions}}',
  },
  xContributionsInCurrentPhase: {
    id: 'app.containers.Projects.xContributionsInCurrentPhase',
    defaultMessage:
      '{ideasCount, plural, no {# contributions} one {# contribution} other {# contributions}} in the current phase',
  },
  xContributionsInFinalPhase: {
    id: 'app.containers.Projects.xContributionsInFinalPhase',
    defaultMessage:
      '{ideasCount, plural, no {# contributions} one {# contribution} other {# contributions}} in the final phase',
  },
  xProjects: {
    id: 'app.containers.Projects.xProjects',
    defaultMessage:
      '{ideasCount, plural, no {# projects} one {# project} other {# projects}}',
  },
  xProjectsInCurrentPhase: {
    id: 'app.containers.Projects.xProjectsInCurrentPhase',
    defaultMessage:
      '{ideasCount, plural, no {# projects} one {# project} other {# projects}} in the current phase',
  },
  xProjectsInFinalPhase: {
    id: 'app.containers.Projects.xProjectsInFinalPhase',
    defaultMessage:
      '{ideasCount, plural, no {# projects} one {# project} other {# projects}} in the final phase',
  },
  xOptions: {
    id: 'app.containers.Projects.xOptions',
    defaultMessage:
      '{ideasCount, plural, no {# options} one {# option} other {# options}}',
  },
  xOptionsInCurrentPhase: {
    id: 'app.containers.Projects.xOptionsInCurrentPhase',
    defaultMessage:
      '{ideasCount, plural, no {# options} one {# option} other {# options}} in the current phase',
  },
  xOptionsInFinalPhase: {
    id: 'app.containers.Projects.xOptionsInFinalPhase',
    defaultMessage:
      '{ideasCount, plural, no {# options} one {# option} other {# options}} in the final phase',
  },
  xIssues: {
    id: 'app.containers.Projects.xIssues',
    defaultMessage:
      '{ideasCount, plural, no {# issues} one {# issue} other {# issues}}',
  },
  xIssuesInCurrentPhase: {
    id: 'app.containers.Projects.xIssuesInCurrentPhase',
    defaultMessage:
      '{ideasCount, plural, no {# issues} one {# issue} other {# issues}} in the current phase',
  },
  xIssuesInFinalPhase: {
    id: 'app.containers.Projects.xIssuesInFinalPhase',
    defaultMessage:
      '{ideasCount, plural, no {# issues} one {# issue} other {# issues}} in the final phase',
  },
  xQuestions: {
    id: 'app.containers.Projects.xQuestions',
    defaultMessage:
      '{ideasCount, plural, no {# questions} one {# questions} other {# questions}}',
  },
  xQuestionsInCurrentPhase: {
    id: 'app.containers.Projects.xQuestionsInCurrentPhase',
    defaultMessage:
      '{ideasCount, plural, no {# questions} one {# question} other {# questions}} in the current phase',
  },
  xQuestionsInFinalPhase: {
    id: 'app.containers.Projects.xQuestionsInFinalPhase',
    defaultMessage:
      '{ideasCount, plural, no {# questions} one {# question} other {# questions}} in the final phase',
  },
  xSurveys: {
    id: 'app.containers.Projects.xSurveys',
    defaultMessage:
      '{surveysCount, plural, no {# surveys} one {# survey} other {# surveys}}',
  },
  xSurveysInCurrentPhase: {
    id: 'app.containers.Projects.xSurveysInCurrentPhase',
    defaultMessage:
      '{surveysCount, plural, no {# surveys} one {# survey} other {# surveys}} in the current phase',
  },
  poll: {
    id: 'app.containers.Projects.poll',
    defaultMessage: '1 poll',
  },
  pollInCurrentPhase: {
    id: 'app.containers.Projects.pollInCurrentPhase',
    defaultMessage: '1 poll in the current phase',
  },
  budget: {
    id: 'app.containers.Projects.budget',
    defaultMessage: '{amount} budget',
  },
  nothingPosted: {
    id: 'app.containers.Projects.nothingPosted',
    defaultMessage: 'Nothing posted yet',
  },
  xPhases: {
    id: 'app.containers.Projects.xPhases',
    defaultMessage:
      '{phasesCount, plural, no {# phases} one {# phase} other {# phases}}',
  },
  xParticipants: {
    id: 'app.containers.Projects.xParticipants',
    defaultMessage:
      '{participantsCount, plural, no {# participants} one {# participant} other {# participants}}',
  },
  xUpcomingEvents: {
    id: 'app.containers.Projects.xUpcomingEvents',
    defaultMessage:
      '{upcomingEventsCount, plural, no {# upcoming events} one {# upcoming event} other {# upcoming events}}',
  },
  allocateBudget: {
    id: 'app.containers.Projects.allocateBudget',
    defaultMessage: 'Allocate your budget',
  },
  takeTheSurvey: {
    id: 'app.containers.Projects.takeTheSurvey',
    defaultMessage: 'Take the survey',
  },
  takeThePoll: {
    id: 'app.containers.Projects.takeThePoll',
    defaultMessage: 'Take the poll',
  },
  ideas: {
    id: 'app.containers.Projects.ideas',
    defaultMessage: 'Ideas',
  },
  contributions: {
    id: 'app.containers.Projects.contributions',
    defaultMessage: 'Contributions',
  },
  issues: {
    id: 'app.containers.Projects.issues',
    defaultMessage: 'Issues',
  },
  options: {
    id: 'app.containers.Projects.options',
    defaultMessage: 'Options',
  },
  questions: {
    id: 'app.containers.Projects.questions',
    defaultMessage: 'Questions',
  },
  projects: {
    id: 'app.containers.Projects.projects',
    defaultMessage: 'Projects',
  },
  survey: {
    id: 'app.containers.Projects.survey',
    defaultMessage: 'Survey',
  },
  timeline: {
    id: 'app.containers.Projects.timeline',
    defaultMessage: 'Timeline',
  },
  share: {
    id: 'app.containers.Projects.share',
    defaultMessage: 'Share',
  },
  shareThisProject: {
    id: 'app.containers.Projects.shareThisProject',
    defaultMessage: 'Share this project',
  },
  readMore: {
    id: 'app.containers.Projects.readMore',
    defaultMessage: 'Read more',
  },
  seeLess: {
    id: 'app.containers.Projects.seeLess',
    defaultMessage: 'See less',
  },
  startsAt: {
    id: 'app.containers.Projects.startsAt',
    defaultMessage: 'Starts at',
  },
  endsAt: {
    id: 'app.containers.Projects.endsAt',
    defaultMessage: 'Ends at',
  },
  xEvents: {
    id: 'app.containers.Projects.xEvents',
    defaultMessage: '{eventsCount, plural, one {# event} other {# events}}',
  },
  seeTheIdeas: {
    id: 'app.containers.Projects.seeTheIdeas',
    defaultMessage: 'See the ideas',
  },
  seeTheOptions: {
    id: 'app.containers.Projects.seeTheOptions',
    defaultMessage: 'See the options',
  },
  seeTheProjects: {
    id: 'app.containers.Projects.seeTheProjects',
    defaultMessage: 'See the projects',
  },
  seeTheQuestions: {
    id: 'app.containers.Projects.seeTheQuestions',
    defaultMessage: 'See the questions',
  },
  seeTheIssues: {
    id: 'app.containers.Projects.seeTheIssues',
    defaultMessage: 'See the issues',
  },
  seeTheContributions: {
    id: 'app.containers.Projects.seeTheContributions',
    defaultMessage: 'See the contributions',
  },
});
