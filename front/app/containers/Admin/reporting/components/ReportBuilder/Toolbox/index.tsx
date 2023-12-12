import React from 'react';

// components
import Container from 'components/admin/ContentBuilder/Toolbox/Container';
import { Box, Title, Accordion } from '@citizenlab/cl2-component-library';

// widgets
import TwoColumn from '../Widgets/TwoColumn';
import WhiteSpace from 'components/admin/ContentBuilder/Widgets/WhiteSpace';
import TitleWidget from '../Widgets/Title';
import Text from '../Widgets/Text';
import Image from '../Widgets/Image';
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

// messages
import contentBuilderMessages from 'components/admin/ContentBuilder/messages';
import reportBuilderMessages from '../../../messages';
import textMessages from 'components/admin/ContentBuilder/Widgets/Text/messages';

// hooks
import { useReportContext } from 'containers/Admin/reporting/context/ReportContext';

// utils
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import moment from 'moment';

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
  const { projectId, phaseId } = useReportContext();

  // Default end date for charts (today)
  const chartEndDate = moment().format('YYYY-MM-DD');

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
              <TitleWidget
                text={formatMessage(TitleWidget.craft.custom.title)}
              />
            }
            icon="text"
            label={formatMessage(TitleWidget.craft.custom.title)}
          />
          <DraggableElement
            id="e2e-draggable-text"
            component={<Text text={formatMessage(textMessages.textValue)} />}
            icon="text"
            label={formatMessage(Text.craft.custom.title)}
          />
          <DraggableElement
            id="e2e-draggable-image"
            component={<Image alt="" />}
            icon="image"
            label={formatMessage(Image.craft.custom.title)}
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
                title={formatMessage(SurveyResultsWidget.craft.custom.title)}
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
                title={formatMessage(MostReactedIdeasWidget.craft.custom.title)}
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
                title={formatMessage(VisitorsWidget.craft.custom.title)}
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
                title={formatMessage(
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
                title={formatMessage(GenderWidget.craft.custom.title)}
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
                title={formatMessage(AgeWidget.craft.custom.title)}
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
                title={formatMessage(ActiveUsersWidget.craft.custom.title)}
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
                title={formatMessage(PostsByTimeWidget.craft.custom.title)}
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
                title={formatMessage(CommentsByTimeWidget.craft.custom.title)}
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
                title={formatMessage(ReactionsByTimeWidget.craft.custom.title)}
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
