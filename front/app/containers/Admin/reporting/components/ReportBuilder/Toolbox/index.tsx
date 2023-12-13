import React from 'react';
import moment from 'moment';

// components
import Container from 'components/admin/ContentBuilder/Toolbox/Container';
import { Box, Title, Accordion } from '@citizenlab/cl2-component-library';

// shared widgets
import TextMultiloc from 'components/admin/ContentBuilder/Widgets/TextMultiloc';
import WhiteSpace from 'components/admin/ContentBuilder/Widgets/WhiteSpace';
import ImageMultiloc from 'components/admin/ContentBuilder/Widgets/ImageMultiloc';

// widgets
import TwoColumn from '../Widgets/TwoColumn';
import TitleMultiloc from '../Widgets/TitleMultiloc';
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
import textMessages from 'components/admin/ContentBuilder/Widgets/TextMultiloc/messages';
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
            label={formatMessage(TwoColumn.craft.custom.title)}
          />
          <DraggableElement
            id="e2e-draggable-white-space"
            component={<WhiteSpace size="small" />}
            icon="layout-white-space"
            label={formatMessage(WhiteSpace.craft.custom.title)}
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
            label={formatMessage(AboutReportWidget.craft.custom.title)}
          />
          <DraggableElement
            id="e2e-draggable-title"
            component={
              <TitleMultiloc
                text={toMultiloc(TitleMultiloc.craft.custom.title)}
              />
            }
            icon="text"
            label={formatMessage(TitleMultiloc.craft.custom.title)}
          />
          <DraggableElement
            id="e2e-draggable-text"
            component={
              <TextMultiloc text={toMultiloc(textMessages.textMultiloc)} />
            }
            icon="text"
            label={formatMessage(TextMultiloc.craft.custom.title)}
          />
          <DraggableElement
            id="e2e-draggable-image"
            component={<ImageMultiloc />}
            icon="image"
            label={formatMessage(ImageMultiloc.craft.custom.title)}
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
                title={toMultiloc(SurveyResultsWidget.craft.custom.title)}
                phaseId={phaseId}
              />
            }
            icon="survey"
            label={formatMessage(SurveyResultsWidget.craft.custom.title)}
          />
          <DraggableElement
            id="e2e-most-reacted-ideas-widget"
            component={
              <MostReactedIdeasWidget
                title={toMultiloc(MostReactedIdeasWidget.craft.custom.title)}
                numberOfIdeas={5}
                collapseLongText={false}
                projectId={projectId}
              />
            }
            icon="idea"
            label={formatMessage(MostReactedIdeasWidget.craft.custom.title)}
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
                title={toMultiloc(VisitorsWidget.craft.custom.title)}
                projectId={projectId}
                startAt={undefined}
                endAt={chartEndDate}
              />
            }
            icon="chart-bar"
            label={formatMessage(VisitorsWidget.craft.custom.title)}
          />
          <DraggableElement
            id="e2e-draggable-visitors-traffic-sources-widget"
            component={
              <VisitorsTrafficSourcesWidget
                title={toMultiloc(
                  VisitorsTrafficSourcesWidget.craft.custom.title
                )}
                projectId={projectId}
                startAt={undefined}
                endAt={chartEndDate}
              />
            }
            icon="chart-bar"
            label={formatMessage(
              VisitorsTrafficSourcesWidget.craft.custom.title
            )}
          />
          <DraggableElement
            id="e2e-draggable-users-by-gender-widget"
            component={
              <GenderWidget
                title={toMultiloc(GenderWidget.craft.custom.title)}
                projectId={projectId}
                startAt={undefined}
                endAt={chartEndDate}
              />
            }
            icon="chart-bar"
            label={formatMessage(GenderWidget.craft.custom.title)}
          />
          <DraggableElement
            id="e2e-draggable-users-by-age-widget"
            component={
              <AgeWidget
                title={toMultiloc(AgeWidget.craft.custom.title)}
                projectId={projectId}
                startAt={undefined}
                endAt={chartEndDate}
              />
            }
            icon="chart-bar"
            label={formatMessage(AgeWidget.craft.custom.title)}
          />
          <DraggableElement
            id="e2e-draggable-active-users-widget"
            component={
              <ActiveUsersWidget
                title={toMultiloc(ActiveUsersWidget.craft.custom.title)}
                projectId={projectId}
                startAt={undefined}
                endAt={chartEndDate}
              />
            }
            icon="chart-bar"
            label={formatMessage(ActiveUsersWidget.craft.custom.title)}
          />
          <DraggableElement
            id="e2e-draggable-posts-by-time-widget"
            component={
              <PostsByTimeWidget
                title={toMultiloc(PostsByTimeWidget.craft.custom.title)}
                projectId={projectId}
                startAt={undefined}
                endAt={chartEndDate}
              />
            }
            icon="chart-bar"
            label={formatMessage(PostsByTimeWidget.craft.custom.title)}
          />
          <DraggableElement
            id="e2e-draggable-comments-by-time-widget"
            component={
              <CommentsByTimeWidget
                title={toMultiloc(CommentsByTimeWidget.craft.custom.title)}
                projectId={projectId}
                startAt={undefined}
                endAt={chartEndDate}
              />
            }
            icon="chart-bar"
            label={formatMessage(CommentsByTimeWidget.craft.custom.title)}
          />
          <DraggableElement
            id="e2e-draggable-reactions-by-time-widget"
            component={
              <ReactionsByTimeWidget
                title={toMultiloc(ReactionsByTimeWidget.craft.custom.title)}
                projectId={projectId}
                startAt={undefined}
                endAt={chartEndDate}
              />
            }
            icon="chart-bar"
            label={formatMessage(ReactionsByTimeWidget.craft.custom.title)}
          />
        </Accordion>
      </Box>
    </Container>
  );
};

export default ReportBuilderToolbox;
