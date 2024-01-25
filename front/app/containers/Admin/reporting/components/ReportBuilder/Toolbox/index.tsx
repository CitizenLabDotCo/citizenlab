import React from 'react';
import moment from 'moment';

// components
import Container from 'components/admin/ContentBuilder/Toolbox/Container';
import { Box, Title, Accordion } from '@citizenlab/cl2-component-library';

// shared widgets
import WhiteSpace from 'components/admin/ContentBuilder/Widgets/WhiteSpace';

// widgets
import TextMultiloc from '../Widgets/TextMultiloc';
import TwoColumn from '../Widgets/TwoColumn';
import TitleMultiloc from '../Widgets/TitleMultiloc';
import ImageMultiloc from '../Widgets/ImageMultiloc';
import AboutReportWidget from '../Widgets/AboutReportWidget';
import SurveyResultsWidget from '../Widgets/SurveyResultsWidget';
import VisitorsWidget from '../Widgets/ChartWidgets/VisitorsWidget';
import VisitorsTrafficSourcesWidget from '../Widgets/ChartWidgets/VisitorsTrafficSourcesWidget';
import AgeWidget from '../Widgets/ChartWidgets/AgeWidget';
import GenderWidget from '../Widgets/ChartWidgets/GenderWidget';
import ActiveUsersWidget from '../Widgets/ChartWidgets/ActiveUsersWidget';
import MostReactedIdeasWidget from '../Widgets/MostReactedIdeasWidget';
import PostsByTimeWidget from '../Widgets/ChartWidgets/PostsByTimeWidget';
import CommentsByTimeWidget from '../Widgets/ChartWidgets/CommentsByTimeWidget';
import ReactionsByTimeWidget from '../Widgets/ChartWidgets/ReactionsByTimeWidget';
import DraggableElement from 'components/admin/ContentBuilder/Toolbox/DraggableElement';

// i18n
import contentBuilderMessages from 'components/admin/ContentBuilder/messages';
import reportBuilderMessages from '../../../messages';
import { WIDGET_TITLES } from '../Widgets';
import {
  FormattedMessage,
  useIntl,
  useFormatMessageWithLocale,
  MessageDescriptor,
} from 'utils/cl-intl';

// hooks
import { useReportContext } from 'containers/Admin/reporting/context/ReportContext';
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';

// utils
import { createMultiloc } from 'containers/Admin/reporting/utils/multiloc';

type ReportBuilderToolboxProps = {
  reportId: string;
};

const SectionTitle = ({ children }) => (
  <Title
    fontWeight="normal"
    ml="10px"
    variant="h6"
    as="h3"
    mb="8px"
    mt="8px"
    color="textSecondary"
  >
    {children}
  </Title>
);

const ReportBuilderToolbox = ({ reportId }: ReportBuilderToolboxProps) => {
  const { formatMessage } = useIntl();
  const formatMessageWithLocale = useFormatMessageWithLocale();
  const { projectId, phaseId } = useReportContext();
  const appConfigurationLocales = useAppConfigurationLocales();

  if (!appConfigurationLocales) return null;

  // Default end date for charts (today)
  const chartEndDate = moment().format('YYYY-MM-DD');

  const toMultiloc = (message: MessageDescriptor) => {
    return createMultiloc(appConfigurationLocales, (locale) => {
      return formatMessageWithLocale(locale, message);
    });
  };

  return (
    <Container>
      <Box>
        <Accordion
          isOpenByDefault={true}
          title={
            <SectionTitle>
              <FormattedMessage {...contentBuilderMessages.layout} />
            </SectionTitle>
          }
        >
          <DraggableElement
            id="e2e-draggable-two-column"
            component={<TwoColumn columnLayout="1-1" />}
            icon="layout-2column-1"
            label={formatMessage(WIDGET_TITLES.TwoColumn)}
          />
          <DraggableElement
            id="e2e-draggable-white-space"
            component={<WhiteSpace size="small" />}
            icon="layout-white-space"
            label={formatMessage(WIDGET_TITLES.WhiteSpace)}
          />
        </Accordion>

        <Accordion
          isOpenByDefault={true}
          title={
            <SectionTitle>
              <FormattedMessage {...contentBuilderMessages.content} />
            </SectionTitle>
          }
        >
          <DraggableElement
            id="e2e-draggable-about-report"
            component={
              <AboutReportWidget reportId={reportId} projectId={projectId} />
            }
            icon="section-image-text"
            label={formatMessage(WIDGET_TITLES.AboutReportWidget)}
          />
          <DraggableElement
            id="e2e-draggable-title"
            component={
              <TitleMultiloc text={toMultiloc(WIDGET_TITLES.TitleMultiloc)} />
            }
            icon="text"
            label={formatMessage(WIDGET_TITLES.TitleMultiloc)}
          />
          <DraggableElement
            id="e2e-draggable-text"
            component={
              <TextMultiloc text={toMultiloc(WIDGET_TITLES.TextMultiloc)} />
            }
            icon="text"
            label={formatMessage(WIDGET_TITLES.TextMultiloc)}
          />
          <DraggableElement
            id="e2e-draggable-image"
            component={<ImageMultiloc />}
            icon="image"
            label={formatMessage(WIDGET_TITLES.ImageMultiloc)}
          />
        </Accordion>

        <Accordion
          isOpenByDefault={true}
          title={
            <SectionTitle>
              <FormattedMessage {...reportBuilderMessages.resultsSection} />
            </SectionTitle>
          }
        >
          {
            // TODO: CL-2307 Only show this if there are surveys in the platform
            // TODO: Add in the default project / phase
          }
          <DraggableElement
            id="e2e-draggable-survey-results-widget"
            component={
              <SurveyResultsWidget
                title={toMultiloc(WIDGET_TITLES.SurveyResultsWidget)}
                projectId={projectId}
                phaseId={phaseId}
              />
            }
            icon="survey"
            label={formatMessage(WIDGET_TITLES.SurveyResultsWidget)}
          />
          <DraggableElement
            id="e2e-most-reacted-ideas-widget"
            component={
              <MostReactedIdeasWidget
                title={toMultiloc(WIDGET_TITLES.MostReactedIdeasWidget)}
                numberOfIdeas={5}
                collapseLongText={false}
                projectId={projectId}
              />
            }
            icon="idea"
            label={formatMessage(WIDGET_TITLES.MostReactedIdeasWidget)}
          />
        </Accordion>

        <Accordion
          isOpenByDefault={true}
          title={
            <SectionTitle>
              <FormattedMessage {...reportBuilderMessages.chartsSection} />
            </SectionTitle>
          }
        >
          <DraggableElement
            id="e2e-draggable-visitors-timeline-widget"
            component={
              <VisitorsWidget
                title={toMultiloc(WIDGET_TITLES.VisitorsWidget)}
                projectId={projectId}
                startAt={undefined}
                endAt={chartEndDate}
              />
            }
            icon="chart-bar"
            label={formatMessage(WIDGET_TITLES.VisitorsWidget)}
          />
          <DraggableElement
            id="e2e-draggable-visitors-traffic-sources-widget"
            component={
              <VisitorsTrafficSourcesWidget
                title={toMultiloc(WIDGET_TITLES.VisitorsTrafficSourcesWidget)}
                projectId={projectId}
                startAt={undefined}
                endAt={chartEndDate}
              />
            }
            icon="chart-bar"
            label={formatMessage(WIDGET_TITLES.VisitorsTrafficSourcesWidget)}
          />
          <DraggableElement
            id="e2e-draggable-users-by-gender-widget"
            component={
              <GenderWidget
                title={toMultiloc(WIDGET_TITLES.GenderWidget)}
                projectId={projectId}
                startAt={undefined}
                endAt={chartEndDate}
              />
            }
            icon="chart-bar"
            label={formatMessage(WIDGET_TITLES.GenderWidget)}
          />
          <DraggableElement
            id="e2e-draggable-users-by-age-widget"
            component={
              <AgeWidget
                title={toMultiloc(WIDGET_TITLES.AgeWidget)}
                projectId={projectId}
                startAt={undefined}
                endAt={chartEndDate}
              />
            }
            icon="chart-bar"
            label={formatMessage(WIDGET_TITLES.AgeWidget)}
          />
          <DraggableElement
            id="e2e-draggable-active-users-widget"
            component={
              <ActiveUsersWidget
                title={toMultiloc(WIDGET_TITLES.ActiveUsersWidget)}
                projectId={projectId}
                startAt={undefined}
                endAt={chartEndDate}
              />
            }
            icon="chart-bar"
            label={formatMessage(WIDGET_TITLES.ActiveUsersWidget)}
          />
          <DraggableElement
            id="e2e-draggable-posts-by-time-widget"
            component={
              <PostsByTimeWidget
                title={toMultiloc(WIDGET_TITLES.PostsByTimeWidget)}
                projectId={projectId}
                startAt={undefined}
                endAt={chartEndDate}
              />
            }
            icon="chart-bar"
            label={formatMessage(WIDGET_TITLES.PostsByTimeWidget)}
          />
          <DraggableElement
            id="e2e-draggable-comments-by-time-widget"
            component={
              <CommentsByTimeWidget
                title={toMultiloc(WIDGET_TITLES.CommentsByTimeWidget)}
                projectId={projectId}
                startAt={undefined}
                endAt={chartEndDate}
              />
            }
            icon="chart-bar"
            label={formatMessage(WIDGET_TITLES.CommentsByTimeWidget)}
          />
          <DraggableElement
            id="e2e-draggable-reactions-by-time-widget"
            component={
              <ReactionsByTimeWidget
                title={toMultiloc(WIDGET_TITLES.ReactionsByTimeWidget)}
                projectId={projectId}
                startAt={undefined}
                endAt={chartEndDate}
              />
            }
            icon="chart-bar"
            label={formatMessage(WIDGET_TITLES.ReactionsByTimeWidget)}
          />
        </Accordion>
      </Box>
    </Container>
  );
};

export default ReportBuilderToolbox;
