import React from 'react';

import { useTheme } from 'styled-components';
import { SupportedLocale } from 'typings';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import useAppConfigurationLocales, {
  createMultiloc,
} from 'hooks/useAppConfigurationLocales';
import useFeatureFlag from 'hooks/useFeatureFlag';

import Container from 'components/admin/ContentBuilder/Toolbox/Container';
import DraggableElement from 'components/admin/ContentBuilder/Toolbox/DraggableElement';
import Section from 'components/admin/ContentBuilder/Toolbox/Section';
import AccordionMultiloc, {
  accordionMultilocTitle,
} from 'components/admin/ContentBuilder/Widgets/AccordionMultiloc';
import ButtonMultiloc, {
  buttonMultilocTitle,
} from 'components/admin/ContentBuilder/Widgets/ButtonMultiloc';
import IframeMultiloc, {
  iframeTitle,
} from 'components/admin/ContentBuilder/Widgets/IframeMultiloc';
import ImageMultiloc, {
  imageMultilocTitle,
} from 'components/admin/ContentBuilder/Widgets/ImageMultiloc';
import ThreeColumn, {
  threeColumnTitle,
} from 'components/admin/ContentBuilder/Widgets/ThreeColumn';
import TwoColumn, {
  twoColumnTitle,
} from 'components/admin/ContentBuilder/Widgets/TwoColumn';
import WhiteSpace, {
  whiteSpaceTitle,
} from 'components/admin/ContentBuilder/Widgets/WhiteSpace';

import {
  useIntl,
  useFormatMessageWithLocale,
  MessageDescriptor,
} from 'utils/cl-intl';

import messages from '../../messages';
import Areas, { areasTitle } from '../Widgets/Areas';
import CallToAction, { callToActionTitle } from '../Widgets/CallToAction';
import CommunityMonitorCTA, {
  communityMonitorCTATitle,
} from '../Widgets/CommunityMonitorCTA';
import Events from '../Widgets/Events';
import FinishedOrArchived, {
  finishedOrArchivedTitle,
} from '../Widgets/FinishedOrArchived';
import finishedOrArchivedMessages from '../Widgets/FinishedOrArchived/messages';
import FollowedItems, { followedItemsTitle } from '../Widgets/FollowedItems';
import followedItemsMessages from '../Widgets/FollowedItems/messages';
import HomepageBanner, { homepageBannerTitle } from '../Widgets/HomepageBanner';
import {
  getHomepageBannerDefaultImage,
  getHomepageBannerDefaultSettings,
} from '../Widgets/HomepageBanner/utils';
import ImageTextCards from '../Widgets/ImageTextCards';
import OpenToParticipation, {
  openToParticipationTitle,
} from '../Widgets/OpenToParticipation';
import ProjectsAndFoldersLegacy, {
  projectsAndFoldersLegacyTitle,
} from '../Widgets/ProjectsAndFoldersLegacy';
import projectsMessages from '../Widgets/ProjectsAndFoldersLegacy/messages';
import Published, { publishedTitle } from '../Widgets/Published';
import Selection, { selectionTitle } from '../Widgets/Selection';
import Spotlight, {
  spotlightTitle,
  buttonTextDefault,
} from '../Widgets/Spotlight';
import TextMultiloc, { textMultilocTitle } from '../Widgets/TextMultiloc';

import { platformCreatedBeforeReleaseNewWidgets } from './utils';

type HomepageBuilderToolboxProps = {
  selectedLocale: SupportedLocale;
};

const HomepageBuilderToolbox = ({
  selectedLocale,
}: HomepageBuilderToolboxProps) => {
  const theme = useTheme();
  const { formatMessage } = useIntl();
  const formatMessageWithLocale = useFormatMessageWithLocale();
  const appConfigurationLocales = useAppConfigurationLocales();
  const followEnabled = useFeatureFlag({ name: 'follow' });
  const communityMonitorEnabled = useFeatureFlag({ name: 'community_monitor' });

  const { data: appConfiguration } = useAppConfiguration();

  if (!appConfigurationLocales || !appConfiguration) return null;

  const toMultiloc = (message: MessageDescriptor) => {
    return createMultiloc(appConfigurationLocales, (locale) => {
      return formatMessageWithLocale(locale, message);
    });
  };

  return (
    <Container>
      <Section>
        <DraggableElement
          id="e2e-draggable-homepage-banner"
          component={
            <HomepageBanner
              homepageSettings={getHomepageBannerDefaultSettings(
                theme.colors.tenantPrimary
              )}
              image={getHomepageBannerDefaultImage()}
            />
          }
          icon="rectangle"
          label={formatMessage(homepageBannerTitle)}
        />
        <DraggableElement
          id="e2e-draggable-open-to-participation"
          component={
            <OpenToParticipation
              titleMultiloc={toMultiloc(openToParticipationTitle)}
            />
          }
          icon="personRaisedHand"
          label={formatMessage(openToParticipationTitle)}
        />
        <DraggableElement
          id="e2e-draggable-followed-items"
          component={
            <FollowedItems
              titleMultiloc={toMultiloc(followedItemsMessages.defaultTitle)}
            />
          }
          icon="notification"
          label={formatMessage(followedItemsTitle)}
        />
        <DraggableElement
          id="e2e-draggable-finished-or-archived"
          component={
            <FinishedOrArchived
              titleMultiloc={toMultiloc(
                finishedOrArchivedMessages.youSaidWeDid
              )}
              filterBy="finished"
            />
          }
          icon="sportsScore"
          label={formatMessage(finishedOrArchivedTitle)}
        />
        {followEnabled && (
          <DraggableElement
            id="e2e-draggable-areas"
            component={<Areas titleMultiloc={toMultiloc(areasTitle)} />}
            icon="home"
            label={formatMessage(areasTitle)}
          />
        )}
        <DraggableElement
          id="e2e-draggable-spotlight"
          component={
            <Spotlight
              buttonTextMultiloc={toMultiloc(buttonTextDefault)}
              hideAvatars={false}
            />
          }
          icon="flash"
          label={formatMessage(spotlightTitle)}
        />
        <DraggableElement
          id="e2e-draggable-selection"
          component={
            <Selection
              titleMultiloc={toMultiloc(selectionTitle)}
              adminPublicationIds={[]}
            />
          }
          icon="folder-outline"
          label={formatMessage(selectionTitle)}
        />
        <DraggableElement
          id="e2e-draggable-published"
          component={<Published titleMultiloc={toMultiloc(publishedTitle)} />}
          icon="check-circle"
          label={formatMessage(publishedTitle)}
        />
        <DraggableElement
          id="e2e-draggable-events"
          component={<Events />}
          icon="calendar"
          label={formatMessage(messages.eventsTitle)}
        />
        <DraggableElement
          id="e2e-draggable-call-to-action"
          component={
            <CallToAction primaryButtonText={{}} secondaryButtonText={{}} />
          }
          icon="button"
          label={formatMessage(callToActionTitle)}
        />
        {communityMonitorEnabled && (
          <DraggableElement
            id="e2e-draggable-community-monitor-cta"
            component={
              <CommunityMonitorCTA
                title={toMultiloc(messages.communityMonitorCtaDefaultTitle)}
                description={toMultiloc(
                  messages.communityMonitorCtaDefaultDescription
                )}
                surveyButtonText={toMultiloc(
                  messages.communityMonitorCtaDefaultSurveyButtonText
                )}
              />
            }
            icon="survey"
            label={formatMessage(communityMonitorCTATitle)}
          />
        )}
        {platformCreatedBeforeReleaseNewWidgets(
          appConfiguration.data.attributes.created_at
        ) && (
          <DraggableElement
            id="e2e-draggable-projects"
            component={
              <ProjectsAndFoldersLegacy
                currentlyWorkingOnText={toMultiloc(
                  projectsMessages.projectsTitlePlaceholder
                )}
              />
            }
            icon="projects"
            label={formatMessage(projectsAndFoldersLegacyTitle)}
          />
        )}
      </Section>
      <Section>
        <DraggableElement
          id="e2e-draggable-text-multiloc"
          component={<TextMultiloc text={{}} />}
          icon="text"
          label={formatMessage(textMultilocTitle)}
        />
        <DraggableElement
          id="e2e-draggable-white-space"
          component={<WhiteSpace size="small" />}
          icon="layout-white-space"
          label={formatMessage(whiteSpaceTitle)}
        />
        <DraggableElement
          id="e2e-draggable-button"
          component={
            <ButtonMultiloc
              text={{}}
              url={''}
              type={'primary'}
              alignment={'left'}
            />
          }
          icon="button"
          label={formatMessage(buttonMultilocTitle)}
        />
        <DraggableElement
          id="e2e-draggable-image"
          component={<ImageMultiloc alt={{}} />}
          icon="image"
          label={formatMessage(imageMultilocTitle)}
        />
        <DraggableElement
          id="e2e-draggable-iframe"
          component={
            <IframeMultiloc
              url=""
              height={500}
              hasError={false}
              selectedLocale={selectedLocale}
            />
          }
          icon="code"
          label={formatMessage(iframeTitle)}
        />
        <DraggableElement
          id="e2e-draggable-accordion"
          component={<AccordionMultiloc title={{}} text={{}} />}
          icon="accordion"
          label={formatMessage(accordionMultilocTitle)}
        />
        <DraggableElement
          id="e2e-draggable-two-column"
          component={<TwoColumn columnLayout="1-1" />}
          icon="layout-2column-1"
          label={formatMessage(twoColumnTitle)}
        />
        <DraggableElement
          id="e2e-draggable-three-column"
          component={<ThreeColumn />}
          icon="layout-3column"
          label={formatMessage(threeColumnTitle)}
        />
        <DraggableElement
          id="e2e-draggable-image-text-cards"
          component={<ImageTextCards />}
          icon="section-image-text"
          label={formatMessage(messages.imageTextCards)}
        />
      </Section>
    </Container>
  );
};

export default HomepageBuilderToolbox;
