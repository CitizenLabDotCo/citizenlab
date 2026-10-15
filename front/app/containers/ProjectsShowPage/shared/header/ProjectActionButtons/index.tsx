import React, { ReactNode, useEffect, useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { Multiloc } from 'typings';

import useEvents from 'api/events/useEvents';
import useAuthUser from 'api/me/useAuthUser';
import usePhases from 'api/phases/usePhases';
import { getCurrentPhase, getInputTerm, getLastPhase } from 'api/phases/utils';
import useProjectById from 'api/projects/useProjectById';

import useLocalize from 'hooks/useLocalize';

import messages from 'containers/ProjectsShowPage/messages';

import useCustomPageHasEventsWidget from 'components/CustomPageBuilder/useCustomPageHasEventsWidget';
import EmptyParticipationPreview from 'components/ProjectPageBuilder/Widgets/EmptyState/EmptyParticipationPreview';
import useHasEventsWidget from 'components/ProjectPageBuilder/Widgets/Events/useHasEventsWidget';
import SpotlightSurveyActionButton from 'components/ProjectPageBuilder/Widgets/SpotlightSurveys/ActionButton';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';
import { isAdmin } from 'utils/permissions/roles';
import { useLocation, useParams } from 'utils/router';

import { excludeHidden, groupSpotlightSurveys } from '../participationOptions';
import WaysToParticipateModal from '../WaysToParticipateModal';

import MethodCTAButton from './MethodCTAButton';
import SecondaryCTAButton from './SecondaryCTAButton';
import { getMethodCTA, getSecondaryCTA } from './utils';

interface Props {
  projectId: string;
  hiddenOptionIds?: string[];
  collapsedButtonTitleMultiloc?: Multiloc;
  className?: string;
}

const Wrapper = ({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) => (
  <Box
    gap="8px"
    display="flex"
    flexDirection="column"
    className={className || ''}
  >
    {children}
  </Box>
);

const ProjectActionButtons = ({
  projectId,
  hiddenOptionIds,
  collapsedButtonTitleMultiloc,
  className,
}: Props) => {
  const { data: project } = useProjectById(projectId);
  const { data: phases } = usePhases(projectId);
  const { data: authUser } = useAuthUser();
  const [modalOpened, setModalOpened] = useState(false);
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { data: standalonePhases } = usePhases(projectId, 'standalone');
  const { hash: divId } = useLocation();
  // Set when the box is on one of the project's other pages rather than on the project page.
  const { pageSlug } = useParams({ strict: false });
  const { data: events } = useEvents({
    projectIds: [projectId],
    currentAndFutureOnly: true,
    sort: 'start_at',
  });
  const hasEventsWidget = useHasEventsWidget(projectId);
  const pageHasEventsWidget = useCustomPageHasEventsWidget(pageSlug);

  useEffect(() => {
    const element = document.getElementById(divId);
    if (element) {
      element.scrollIntoView();
    }
  }, [divId]);

  if (!project) {
    return null;
  }

  const currentPhase = getCurrentPhase(phases?.data);
  // CTAs that don't need a running phase fall back to the last phase.
  const latestPhase = currentPhase ?? getLastPhase(phases?.data);
  const projectSlug = project.data.attributes.slug;

  const {
    open: openSpotlightSurveyPhases,
    upcoming: upcomingSpotlightSurveyPhases,
  } = groupSpotlightSurveys(standalonePhases?.data);
  const visibleOpenSpotlightSurveys = excludeHidden(
    openSpotlightSurveyPhases,
    hiddenOptionIds
  );
  const visibleUpcomingSpotlightSurveys = excludeHidden(
    upcomingSpotlightSurveyPhases,
    hiddenOptionIds
  );

  const canSeeEmptyState = isAdmin(authUser);
  const showEventsCTA =
    !!events?.data.length && (hasEventsWidget || pageHasEventsWidget);

  const showBoxCTAs = project.data.attributes.publication_status !== 'archived';
  const methodCTA = getMethodCTA({
    currentPhase,
    publicationStatus: project.data.attributes.publication_status,
    hiddenOptionIds,
  });
  const secondaryCTA = getSecondaryCTA({ phase: latestPhase, showEventsCTA });
  const spotlightSurveyCTAs = showBoxCTAs ? visibleOpenSpotlightSurveys : [];

  if (!methodCTA && spotlightSurveyCTAs.length === 0 && !secondaryCTA) {
    if (canSeeEmptyState && showBoxCTAs && !!standalonePhases) {
      return (
        <Wrapper className={className}>
          <EmptyParticipationPreview />
        </Wrapper>
      );
    }

    return null;
  }

  const methodCTAButton =
    methodCTA && currentPhase ? (
      <MethodCTAButton
        methodCTA={methodCTA}
        phase={currentPhase}
        projectId={project.data.id}
        projectSlug={projectSlug}
        onClick={() => setModalOpened(false)}
      />
    ) : null;

  const secondaryCTAButton = secondaryCTA && (
    <SecondaryCTAButton
      secondaryCTA={secondaryCTA}
      phase={latestPhase}
      inputTerm={getInputTerm(phases?.data)}
      projectSlug={projectSlug}
      eventsAreOnProjectPage={!!pageSlug && !pageHasEventsWidget}
    />
  );

  // The embedded survey CTA doesn't count towards collapsing the options.
  const primaryMethodCTACount =
    methodCTA && methodCTA !== 'take_survey' ? 1 : 0;
  const collapseOptions =
    primaryMethodCTACount + spotlightSurveyCTAs.length > 2;

  if (collapseOptions) {
    return (
      <Wrapper className={className}>
        <ButtonWithLink
          onClick={() => setModalOpened(true)}
          fontWeight="500"
          icon="chevron-up"
          iconPos="right"
        >
          {localize(collapsedButtonTitleMultiloc) ||
            formatMessage(messages.participate)}
        </ButtonWithLink>
        <WaysToParticipateModal
          opened={modalOpened}
          onClose={() => setModalOpened(false)}
          methodCTA={methodCTAButton}
          openSpotlightSurveys={spotlightSurveyCTAs}
          upcomingSpotlightSurveys={visibleUpcomingSpotlightSurveys}
        />
        {secondaryCTAButton}
      </Wrapper>
    );
  }

  return (
    <Wrapper className={className}>
      {methodCTAButton}
      {spotlightSurveyCTAs.map((spotlightSurveyPhase, index) => (
        <SpotlightSurveyActionButton
          key={spotlightSurveyPhase.id}
          phase={spotlightSurveyPhase}
          buttonStyle={
            !methodCTA && index === 0 ? 'primary' : 'secondary-outlined'
          }
        />
      ))}
      {secondaryCTAButton}
    </Wrapper>
  );
};

export default ProjectActionButtons;
