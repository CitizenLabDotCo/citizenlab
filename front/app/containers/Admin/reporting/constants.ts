import whiteSpaceMessages from 'components/admin/ContentBuilder/Widgets/WhiteSpace/messages';

import { textMultilocTitle } from './components/ReportBuilder/Widgets/TextMultiloc';
import { twoColumnTitle } from './components/ReportBuilder/Widgets/TwoColumn';
import { titleMultilocTitle } from './components/ReportBuilder/Widgets/TitleMultiloc';
import { imageMultilocTitle } from './components/ReportBuilder/Widgets/ImageMultiloc';
import { aboutReportTitle } from './components/ReportBuilder/Widgets/AboutReportWidget';
import { surveyResultsTitle } from './components/ReportBuilder/Widgets/SurveyResultsWidget';
import { mostReactedIdeasTitle } from './components/ReportBuilder/Widgets/MostReactedIdeasWidget';
import { visitorsTitle } from './components/ReportBuilder/Widgets/ChartWidgets/VisitorsWidget';
import { visitorsTrafficSourcesTitle } from './components/ReportBuilder/Widgets/ChartWidgets/VisitorsTrafficSourcesWidget';
import { ageWidgetTitle } from './components/ReportBuilder/Widgets/ChartWidgets/AgeWidget';
import { genderWidgetTitle } from './components/ReportBuilder/Widgets/ChartWidgets/GenderWidget';
import { activeUsersTitle } from './components/ReportBuilder/Widgets/ChartWidgets/ActiveUsersWidget';
import { postsByTimeTitle } from './components/ReportBuilder/Widgets/ChartWidgets/PostsByTimeWidget';
import { commentsByTimeTitle } from './components/ReportBuilder/Widgets/ChartWidgets/CommentsByTimeWidget';
import { reactionsByTimeTitle } from './components/ReportBuilder/Widgets/ChartWidgets/ReactionsByTimeWidget';

export const WIDGET_TITLES = {
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
  AgeWidget: ageWidgetTitle,
  GenderWidget: genderWidgetTitle,
  ActiveUsersWidget: activeUsersTitle,
  PostsByTimeWidget: postsByTimeTitle,
  CommentsByTimeWidget: commentsByTimeTitle,
  ReactionsByTimeWidget: reactionsByTimeTitle,
};

export const A4_WIDTH = '21cm';
export const MAX_REPORT_WIDTH = '850px';
