import WhiteSpace from 'components/admin/ContentBuilder/Widgets/WhiteSpace';
import whiteSpaceMessages from 'components/admin/ContentBuilder/Widgets/WhiteSpace/messages';

import { MessageDescriptor } from 'utils/cl-intl';

import ReactionsByTimeWidget, {
  reactionsByTimeTitle,
} from './ChartWidgets/_deprecated/ReactionsByTimeWidget';
import DemographicsWidget, {
  demographicsTitle,
} from './ChartWidgets/DemographicsWidget';
import InternalAdoptionWidget, {
  internalAdoptionTitle,
} from './ChartWidgets/InternalAdoptionWidget';
import MethodsUsedWidget, {
  methodsUsedTitle,
} from './ChartWidgets/MethodsUsedWidget';
import ParticipantsWidget, {
  participantsTitle,
} from './ChartWidgets/ParticipantsWidget';
import ParticipationWidget, {
  participationTitle,
} from './ChartWidgets/ParticipationWidget';
import RegistrationsWidget, {
  registrationsTitle,
} from './ChartWidgets/RegistrationsWidget';
import VisitorsTrafficSourcesWidget, {
  visitorsTrafficSourcesTitle,
} from './ChartWidgets/VisitorsTrafficSourcesWidget';
import VisitorsWidget, { visitorsTitle } from './ChartWidgets/VisitorsWidget';
import CommunityMonitorHealthScoreWidget, {
  communityMonitorHealthScoreTitle,
} from './CommunityMonitorHealthScoreWidget';
import IframeMultiloc, { iframeMultilocTitle } from './IframeMultiloc';
import ImageMultiloc, { imageMultilocTitle } from './ImageMultiloc';
import messages from './messages';
import MostReactedIdeasWidget, {
  mostReactedIdeasTitle,
} from './MostReactedIdeasWidget';
import ProjectsTimelineWidget, {
  projectsTimelineTitle,
} from './ProjectsTimelineWidget';
import ProjectsWidget, { projectsTitle } from './ProjectsWidget';
import SingleIdeaWidget, { singleIdeaTitle } from './SingleIdeaWidget';
import SurveyQuestionResultWidget, {
  surveyQuestionResultTitle,
} from './SurveyQuestionResultWidget';
import TextMultiloc, { textMultilocTitle } from './TextMultiloc';
import TwoColumn, { twoColumnTitle } from './TwoColumn';

export const WIDGETS = {
  TwoColumn,
  TextMultiloc,
  ImageMultiloc,
  WhiteSpace,
  SurveyQuestionResultWidget,
  CommunityMonitorHealthScoreWidget,
  VisitorsWidget,
  VisitorsTrafficSourcesWidget,
  MostReactedIdeasWidget,
  SingleIdeaWidget,
  DemographicsWidget,
  IframeMultiloc,
  RegistrationsWidget,
  MethodsUsedWidget,
  ParticipationWidget,
  InternalAdoptionWidget,
  ProjectsWidget,
  // RENAMED (TODO rename in migration)
  ActiveUsersWidget: ParticipantsWidget,
  ParticipantsWidget,

  // DEPRECATED
  ReactionsByTimeWidget,
  ProjectsTimelineWidget,
};

type WidgetName = keyof typeof WIDGETS;

// For the Platform Report Template, we want to use specific
// titles for some widgets.
export const CUSTOM_TEMPLATE_WIDGET_TITLES: Record<string, MessageDescriptor> =
  {
    VisitorsWidgetFromStart: messages.visitorsWidgetFromStart,
    TrafficSourcesWidgetFromStart: messages.trafficSourcesWidgetFromStart,
    TrafficSourcesWidgetSince: messages.trafficSourcesWidgetSince,
    VisitorsWidgetSince: messages.visitorsWidgetSince,
    RegistrationsWidgetFromStart: messages.registrationWidgetFromStart,
    RegistrationsWidgetSince: messages.registrationWidgetSince,
    ParticipantsWidgetFromStart: messages.participantsWidgetFromStart,
    ParticipantsWidgetSince: messages.participantsWidgetSince,
  };

export const WIDGET_TITLES: Record<WidgetName, MessageDescriptor> = {
  WhiteSpace: whiteSpaceMessages.whiteSpace,
  TextMultiloc: textMultilocTitle,
  TwoColumn: twoColumnTitle,
  ImageMultiloc: imageMultilocTitle,
  SurveyQuestionResultWidget: surveyQuestionResultTitle,
  CommunityMonitorHealthScoreWidget: communityMonitorHealthScoreTitle,
  MostReactedIdeasWidget: mostReactedIdeasTitle,
  SingleIdeaWidget: singleIdeaTitle,
  VisitorsWidget: visitorsTitle,
  VisitorsTrafficSourcesWidget: visitorsTrafficSourcesTitle,
  DemographicsWidget: demographicsTitle,
  IframeMultiloc: iframeMultilocTitle,
  RegistrationsWidget: registrationsTitle,
  MethodsUsedWidget: methodsUsedTitle,
  ParticipationWidget: participationTitle,
  InternalAdoptionWidget: internalAdoptionTitle,
  ProjectsWidget: projectsTitle,
  ParticipantsWidget: participantsTitle,

  // RENAMED (TODO rename in migration)
  ActiveUsersWidget: participantsTitle,

  // DEPRECATED
  ReactionsByTimeWidget: reactionsByTimeTitle,
  ProjectsTimelineWidget: projectsTimelineTitle,
};

const WIDGETS_WITH_CHILDREN = new Set<string>([
  'TwoColumn',
] satisfies WidgetName[]);

export const hasChildren = (nodeName: string) => {
  return WIDGETS_WITH_CHILDREN.has(nodeName);
};

const WIDGETS_WITHOUT_POINTER_EVENTS = new Set<string>([
  'VisitorsTrafficSourcesWidget',
  'VisitorsWidget',
  'SurveyQuestionResultWidget',
  'CommunityMonitorHealthScoreWidget',
  'DemographicsWidget',
  'IframeMultiloc',
  'RegistrationsWidget',
  'MethodsUsedWidget',
  'ParticipationWidget',
  'InternalAdoptionWidget',
  'ParticipantsWidget',

  // RENAMED (TODO rename in migration)
  'ActiveUsersWidget',

  // DEPRECATED
  'ReactionsByTimeWidget',
] satisfies WidgetName[]);

export const hasNoPointerEvents = (nodeName: string) => {
  return WIDGETS_WITHOUT_POINTER_EVENTS.has(nodeName);
};
