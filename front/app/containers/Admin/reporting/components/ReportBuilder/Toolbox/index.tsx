import React, { useState } from 'react';

import {
  Box,
  Spinner,
  stylingConsts,
  Button,
  colors,
} from '@citizenlab/cl2-component-library';
import moment from 'moment';
import Transition from 'react-transition-group/Transition';
import { SupportedLocale } from 'typings';

import useAuthUser from 'api/me/useAuthUser';
import usePhases from 'api/phases/usePhases';
import useProjects from 'api/projects/useProjects';
import useUserCustomFields from 'api/user_custom_fields/useUserCustomFields';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';

import tracks from 'containers/Admin/projects/project/analysis/tracks';
import { useReportContext } from 'containers/Admin/reporting/context/ReportContext';
import { createMultiloc } from 'containers/Admin/reporting/utils/multiloc';

import Container from 'components/admin/ContentBuilder/Toolbox/Container';
import DraggableElement from 'components/admin/ContentBuilder/Toolbox/DraggableElement';
import WhiteSpace from 'components/admin/ContentBuilder/Widgets/WhiteSpace';

import { trackEventByName } from 'utils/analytics';
import {
  useIntl,
  useFormatMessageWithLocale,
  MessageDescriptor,
} from 'utils/cl-intl';
import { isModerator } from 'utils/permissions/roles';

import Analysis from '../Analysis';
import { WIDGET_TITLES } from '../Widgets';
import ActiveUsersWidget from '../Widgets/ChartWidgets/ActiveUsersWidget';
import CommentsByTimeWidget from '../Widgets/ChartWidgets/CommentsByTimeWidget';
import DemographicsWidget from '../Widgets/ChartWidgets/DemographicsWidget';
import PostsByTimeWidget from '../Widgets/ChartWidgets/PostsByTimeWidget';
import ReactionsByTimeWidget from '../Widgets/ChartWidgets/ReactionsByTimeWidget';
import RegistrationsWidget from '../Widgets/ChartWidgets/RegistrationsWidget';
import VisitorsTrafficSourcesWidget from '../Widgets/ChartWidgets/VisitorsTrafficSourcesWidget';
import VisitorsWidget from '../Widgets/ChartWidgets/VisitorsWidget';
import IframeMultiloc from '../Widgets/IframeMultiloc';
import ImageMultiloc from '../Widgets/ImageMultiloc';
import MostReactedIdeasWidget from '../Widgets/MostReactedIdeasWidget';
import SingleIdeaWidget from '../Widgets/SingleIdeaWidget';
import SurveyQuestionResultWidget from '../Widgets/SurveyQuestionResultWidget';
import TextMultiloc from '../Widgets/TextMultiloc';
import TwoColumn from '../Widgets/TwoColumn';

import messages from './messages';
import { findSurveyPhaseId, findIdeationPhaseId } from './utils';

type ReportBuilderToolboxProps = {
  selectedLocale: SupportedLocale;
};

const Section = ({ children }) => (
  <Box borderTop={`1px solid ${colors.divider}`} pt="12px" mb="12px">
    {children}
  </Box>
);

const ReportBuilderToolbox = ({
  selectedLocale,
}: ReportBuilderToolboxProps) => {
  const [selectedTab, setSelectedTab] = useState<'widgets' | 'ai'>('widgets');
  const { formatMessage } = useIntl();
  const formatMessageWithLocale = useFormatMessageWithLocale();
  const { projectId } = useReportContext();
  const appConfigurationLocales = useAppConfigurationLocales();
  const { data: authUser } = useAuthUser();

  const userIsModerator = !!authUser && isModerator(authUser);

  const { data: projects } = useProjects(
    {
      publicationStatuses: ['published', 'archived'],
      canModerate: true,
    },
    {
      enabled: userIsModerator,
    }
  );

  const { data: phases } = usePhases(projectId);
  const { data: userFields } = useUserCustomFields({ inputTypes: ['select'] });

  if (
    !appConfigurationLocales ||
    !authUser ||
    (userIsModerator && !projects) ||
    !userFields
  ) {
    return (
      <Container>
        <Box
          h={`calc(100vh - ${stylingConsts.menuHeight}px)`}
          w="100%"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Spinner />
        </Box>
      </Container>
    );
  }

  // Default end date for charts (today)
  const chartEndDate = moment().format('YYYY-MM-DD');

  const toMultiloc = (message: MessageDescriptor) => {
    return createMultiloc(appConfigurationLocales, (locale) => {
      return formatMessageWithLocale(locale, message);
    });
  };

  // If this report is not in a phase context (i.e. projectId is undefined),
  // AND the user is moderator (i.e. projects is defined),
  // we use the first project in the list of projects as the default project.
  const selectedProjectId =
    projectId ?? (userIsModerator ? projects?.data[0]?.id : undefined);

  const surveyPhaseId = phases ? findSurveyPhaseId(phases) : undefined;
  const ideationPhaseId = phases ? findIdeationPhaseId(phases) : undefined;

  const genderField = userFields.data.find(
    (field) => field.attributes.code === 'gender'
  );

  const genderFieldId = genderField?.id;
  const genderFieldTitle = genderField?.attributes.title_multiloc;

  return (
    <Transition in={selectedTab === 'ai'} timeout={1000}>
      <Container
        w={selectedTab === 'ai' ? '330px' : '220px'}
        style={{
          transition: 'all 0.2s ease',
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="center">
          <Box flex="1">
            <Button
              id="e2e-report-builder-widgets-tab"
              onClick={() => setSelectedTab('widgets')}
              buttonStyle={
                selectedTab === 'widgets' ? 'text' : 'secondary-outlined'
              }
            >
              {formatMessage(messages.widgets)}
            </Button>
          </Box>
          <Box flex="1">
            <Button
              icon="stars"
              id="e2e-report-builder-ai-tab"
              onClick={() => {
                setSelectedTab('ai');
                trackEventByName(tracks.openReportBuilderAITab.name);
              }}
              buttonStyle={selectedTab === 'ai' ? 'text' : 'secondary-outlined'}
            >
              {formatMessage(messages.ai)}
            </Button>
          </Box>
        </Box>
        <Box display={selectedTab === 'widgets' ? 'block' : 'none'}>
          <Section>
            <DraggableElement
              id="e2e-draggable-text"
              component={<TextMultiloc />}
              icon="text"
              label={formatMessage(WIDGET_TITLES.TextMultiloc)}
            />
            <DraggableElement
              id="e2e-draggable-image"
              component={<ImageMultiloc stretch />}
              icon="image"
              label={formatMessage(WIDGET_TITLES.ImageMultiloc)}
            />
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
            <DraggableElement
              id="e2e-draggable-iframe"
              component={<IframeMultiloc url="" height={500} />}
              icon="code"
              label={formatMessage(WIDGET_TITLES.IframeMultiloc)}
            />
          </Section>
          <Section>
            <DraggableElement
              id="e2e-draggable-survey-question-result-widget"
              component={
                <SurveyQuestionResultWidget
                  projectId={selectedProjectId}
                  phaseId={surveyPhaseId}
                />
              }
              icon="survey"
              label={formatMessage(WIDGET_TITLES.SurveyQuestionResultWidget)}
            />
            <DraggableElement
              id="e2e-draggable-most-reacted-ideas-widget"
              component={
                <MostReactedIdeasWidget
                  title={toMultiloc(WIDGET_TITLES.MostReactedIdeasWidget)}
                  numberOfIdeas={5}
                  collapseLongText={false}
                  projectId={selectedProjectId}
                  phaseId={ideationPhaseId}
                />
              }
              icon="vote-up"
              label={formatMessage(WIDGET_TITLES.MostReactedIdeasWidget)}
            />
            <DraggableElement
              id="e2e-single-idea-widget"
              component={
                <SingleIdeaWidget
                  collapseLongText={false}
                  showAuthor={true}
                  showContent={true}
                  showReactions={true}
                  showVotes={true}
                  projectId={selectedProjectId}
                  phaseId={ideationPhaseId}
                />
              }
              icon="idea"
              label={formatMessage(WIDGET_TITLES.SingleIdeaWidget)}
            />
          </Section>

          <Section>
            <DraggableElement
              id="e2e-draggable-visitors-timeline-widget"
              component={
                <VisitorsWidget
                  title={toMultiloc(WIDGET_TITLES.VisitorsWidget)}
                  startAt={undefined}
                  endAt={chartEndDate}
                />
              }
              icon="chart-bar"
              label={formatMessage(WIDGET_TITLES.VisitorsWidget)}
            />
            <DraggableElement
              id="e2e-draggable-active-users-widget"
              component={
                <ActiveUsersWidget
                  title={toMultiloc(WIDGET_TITLES.ActiveUsersWidget)}
                  projectId={selectedProjectId}
                  startAt={undefined}
                  endAt={chartEndDate}
                />
              }
              icon="chart-bar"
              label={formatMessage(WIDGET_TITLES.ActiveUsersWidget)}
            />
            <DraggableElement
              id="e2e-draggable-registrations-widget"
              component={
                <RegistrationsWidget
                  title={toMultiloc(WIDGET_TITLES.RegistrationsWidget)}
                  startAt={undefined}
                  endAt={chartEndDate}
                />
              }
              icon="chart-bar"
              label={formatMessage(WIDGET_TITLES.RegistrationsWidget)}
            />
            <DraggableElement
              id="e2e-draggable-visitors-traffic-sources-widget"
              component={
                <VisitorsTrafficSourcesWidget
                  title={toMultiloc(WIDGET_TITLES.VisitorsTrafficSourcesWidget)}
                  projectId={selectedProjectId}
                  startAt={undefined}
                  endAt={chartEndDate}
                />
              }
              icon="chart-bar"
              label={formatMessage(WIDGET_TITLES.VisitorsTrafficSourcesWidget)}
            />
            <DraggableElement
              id="e2e-draggable-demographics-widget"
              component={
                <DemographicsWidget
                  title={genderFieldTitle}
                  projectId={selectedProjectId}
                  startAt={undefined}
                  endAt={chartEndDate}
                  customFieldId={genderFieldId}
                />
              }
              icon="chart-bar"
              label={formatMessage(WIDGET_TITLES.DemographicsWidget)}
            />
            <DraggableElement
              id="e2e-draggable-posts-by-time-widget"
              component={
                <PostsByTimeWidget
                  title={toMultiloc(WIDGET_TITLES.PostsByTimeWidget)}
                  projectId={selectedProjectId}
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
                  projectId={selectedProjectId}
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
                  projectId={selectedProjectId}
                  startAt={undefined}
                  endAt={chartEndDate}
                />
              }
              icon="chart-bar"
              label={formatMessage(WIDGET_TITLES.ReactionsByTimeWidget)}
            />
          </Section>
        </Box>
        <Box p="8px" display={selectedTab === 'ai' ? 'block' : 'none'}>
          <Analysis selectedLocale={selectedLocale} />
        </Box>
      </Container>
    </Transition>
  );
};

export default ReportBuilderToolbox;
