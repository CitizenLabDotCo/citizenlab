import WhiteSpace from 'components/admin/ContentBuilder/Widgets/WhiteSpace';
import whiteSpaceMessages from 'components/admin/ContentBuilder/Widgets/WhiteSpace/messages';

import { MessageDescriptor } from 'utils/cl-intl';

import ReactionsByTimeWidget, {
  reactionsByTimeTitle,
} from './ChartWidgets/_deprecated/ReactionsByTimeWidget';
import DemographicsWidget, {
  demographicsTitle,
} from './ChartWidgets/DemographicsWidget';
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
import MostReactedIdeasWidget, {
  mostReactedIdeasTitle,
} from './MostReactedIdeasWidget';
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
  ProjectsWidget,
  ParticipantsWidget,
  // RENAMED (TODO rename in migration)
  ActiveUsersWidget: ParticipantsWidget,

  // DEPRECATED
  ReactionsByTimeWidget,
};

type WidgetName = keyof typeof WIDGETS;

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
  ProjectsWidget: projectsTitle,
  ParticipantsWidget: participantsTitle,

  // RENAMED (TODO rename in migration)
  ActiveUsersWidget: participantsTitle,

  // DEPRECATED
  ReactionsByTimeWidget: reactionsByTimeTitle,
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
  'ParticipantsWidget',

  // RENAMED (TODO rename in migration)
  'ActiveUsersWidget',

  // DEPRECATED
  'ReactionsByTimeWidget',
] satisfies WidgetName[]);

export const hasNoPointerEvents = (nodeName: string) => {
  return WIDGETS_WITHOUT_POINTER_EVENTS.has(nodeName);
};
