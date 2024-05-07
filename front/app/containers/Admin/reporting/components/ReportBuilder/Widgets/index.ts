import WhiteSpace from 'components/admin/ContentBuilder/Widgets/WhiteSpace';
import whiteSpaceMessages from 'components/admin/ContentBuilder/Widgets/WhiteSpace/messages';

import { MessageDescriptor } from 'utils/cl-intl';

import AboutReportWidget, {
  aboutReportTitle,
} from './_deprecated/AboutReportWidget';
import ActiveUsersWidget, {
  activeUsersTitle,
} from './ChartWidgets/ActiveUsersWidget';
import AgeWidget, { ageTitle } from './ChartWidgets/AgeWidget';
import CommentsByTimeWidget, {
  commentsByTimeTitle,
} from './ChartWidgets/CommentsByTimeWidget';
import GenderWidget, { genderTitle } from './ChartWidgets/GenderWidget';
import PostsByTimeWidget, {
  postsByTimeTitle,
} from './ChartWidgets/PostsByTimeWidget';
import ReactionsByTimeWidget, {
  reactionsByTimeTitle,
} from './ChartWidgets/ReactionsByTimeWidget';
import VisitorsTrafficSourcesWidget, {
  visitorsTrafficSourcesTitle,
} from './ChartWidgets/VisitorsTrafficSourcesWidget';
import VisitorsWidget, { visitorsTitle } from './ChartWidgets/VisitorsWidget';
import IframeMultiloc, { iframeMultilocTitle } from './IframeMultiloc';
import ImageMultiloc, { imageMultilocTitle } from './ImageMultiloc';
import MostReactedIdeasWidget, {
  mostReactedIdeasTitle,
} from './MostReactedIdeasWidget';
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
  VisitorsWidget,
  VisitorsTrafficSourcesWidget,
  AgeWidget,
  GenderWidget,
  ActiveUsersWidget,
  MostReactedIdeasWidget,
  SingleIdeaWidget,
  PostsByTimeWidget,
  CommentsByTimeWidget,
  ReactionsByTimeWidget,
  IframeMultiloc,
  // DEPRECATED
  AboutReportWidget,
};

type WidgetName = keyof typeof WIDGETS;

export const WIDGET_TITLES: Record<WidgetName, MessageDescriptor> = {
  WhiteSpace: whiteSpaceMessages.whiteSpace,
  TextMultiloc: textMultilocTitle,
  TwoColumn: twoColumnTitle,
  ImageMultiloc: imageMultilocTitle,
  SurveyQuestionResultWidget: surveyQuestionResultTitle,
  MostReactedIdeasWidget: mostReactedIdeasTitle,
  SingleIdeaWidget: singleIdeaTitle,
  VisitorsWidget: visitorsTitle,
  VisitorsTrafficSourcesWidget: visitorsTrafficSourcesTitle,
  AgeWidget: ageTitle,
  GenderWidget: genderTitle,
  ActiveUsersWidget: activeUsersTitle,
  PostsByTimeWidget: postsByTimeTitle,
  CommentsByTimeWidget: commentsByTimeTitle,
  ReactionsByTimeWidget: reactionsByTimeTitle,
  IframeMultiloc: iframeMultilocTitle,
  // DEPRECATED
  AboutReportWidget: aboutReportTitle,
};

const WIDGETS_WITH_CHILDREN = new Set<string>([
  'TwoColumn',
] satisfies WidgetName[]);

export const hasChildren = (nodeName: string) => {
  return WIDGETS_WITH_CHILDREN.has(nodeName);
};

const WIDGETS_WITHOUT_POINTER_EVENTS = new Set<string>([
  'ActiveUsersWidget',
  'AgeWidget',
  'CommentsByTimeWidget',
  'GenderWidget',
  'PostsByTimeWidget',
  'ReactionsByTimeWidget',
  'VisitorsTrafficSourcesWidget',
  'VisitorsWidget',
  'SurveyQuestionResultWidget',
  'IframeMultiloc',
] satisfies WidgetName[]);

export const hasNoPointerEvents = (nodeName: string) => {
  return WIDGETS_WITHOUT_POINTER_EVENTS.has(nodeName);
};
