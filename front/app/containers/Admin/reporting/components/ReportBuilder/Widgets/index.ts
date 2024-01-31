// report builder widgets
import TitleMultiloc, { titleMultilocTitle } from './TitleMultiloc';
import TextMultiloc, { textMultilocTitle } from './TextMultiloc';
import ImageMultiloc, { imageMultilocTitle } from './ImageMultiloc';
import TwoColumn, { twoColumnTitle } from './TwoColumn';
import AboutReportWidget, { aboutReportTitle } from './AboutReportWidget';
import SurveyResultsWidget, { surveyResultsTitle } from './SurveyResultsWidget';
import VisitorsWidget, { visitorsTitle } from './ChartWidgets/VisitorsWidget';
import VisitorsTrafficSourcesWidget, {
  visitorsTrafficSourcesTitle,
} from './ChartWidgets/VisitorsTrafficSourcesWidget';
import AgeWidget, { ageTitle } from './ChartWidgets/AgeWidget';
import GenderWidget, { genderTitle } from './ChartWidgets/GenderWidget';
import ActiveUsersWidget, {
  activeUsersTitle,
} from './ChartWidgets/ActiveUsersWidget';
import MostReactedIdeasWidget, {
  mostReactedIdeasTitle,
} from './MostReactedIdeasWidget';
import PostsByTimeWidget, {
  postsByTimeTitle,
} from './ChartWidgets/PostsByTimeWidget';
import CommentsByTimeWidget, {
  commentsByTimeTitle,
} from './ChartWidgets/CommentsByTimeWidget';
import ReactionsByTimeWidget, {
  reactionsByTimeTitle,
} from './ChartWidgets/ReactionsByTimeWidget';

// shared widgets
import WhiteSpace from 'components/admin/ContentBuilder/Widgets/WhiteSpace';
import whiteSpaceMessages from 'components/admin/ContentBuilder/Widgets/WhiteSpace/messages';

// typings
import { MessageDescriptor } from 'utils/cl-intl';

export const WIDGETS = {
  TwoColumn,
  TitleMultiloc,
  TextMultiloc,
  ImageMultiloc,
  WhiteSpace,
  AboutReportWidget,
  SurveyResultsWidget,
  VisitorsWidget,
  VisitorsTrafficSourcesWidget,
  AgeWidget,
  GenderWidget,
  ActiveUsersWidget,
  MostReactedIdeasWidget,
  PostsByTimeWidget,
  CommentsByTimeWidget,
  ReactionsByTimeWidget,
};

type WidgetName = keyof typeof WIDGETS;

export const WIDGET_TITLES: Record<WidgetName, MessageDescriptor> = {
  WhiteSpace: whiteSpaceMessages.whiteSpace,
  TextMultiloc: textMultilocTitle,
  TwoColumn: twoColumnTitle,
  TitleMultiloc: titleMultilocTitle,
  ImageMultiloc: imageMultilocTitle,
  AboutReportWidget: aboutReportTitle,
  SurveyResultsWidget: surveyResultsTitle,
  MostReactedIdeasWidget: mostReactedIdeasTitle,
  VisitorsWidget: visitorsTitle,
  VisitorsTrafficSourcesWidget: visitorsTrafficSourcesTitle,
  AgeWidget: ageTitle,
  GenderWidget: genderTitle,
  ActiveUsersWidget: activeUsersTitle,
  PostsByTimeWidget: postsByTimeTitle,
  CommentsByTimeWidget: commentsByTimeTitle,
  ReactionsByTimeWidget: reactionsByTimeTitle,
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
  'SurveyResultsWidget',
] satisfies WidgetName[]);

export const hasNoPointerEvents = (nodeName: string) => {
  return WIDGETS_WITHOUT_POINTER_EVENTS.has(nodeName);
};
