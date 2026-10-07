import React from 'react';

import useCustomPageById from 'api/custom_pages/useCustomPageById';

import useAppConfigurationLocales, {
  createMultiloc,
} from 'hooks/useAppConfigurationLocales';
import useFeatureFlag from 'hooks/useFeatureFlag';

import heroBannerMessages from 'components/admin/BannerFields/messages';
import Container from 'components/admin/ContentBuilder/Toolbox/Container';
import DraggableElement from 'components/admin/ContentBuilder/Toolbox/DraggableElement';
import Section from 'components/admin/ContentBuilder/Toolbox/Section';
import AccordionMultiloc from 'components/admin/ContentBuilder/Widgets/AccordionMultiloc';
import Areas, {
  areasTitle,
} from 'components/admin/ContentBuilder/Widgets/Areas';
import ButtonMultiloc from 'components/admin/ContentBuilder/Widgets/ButtonMultiloc';
import CallToAction, {
  callToActionTitle,
} from 'components/admin/ContentBuilder/Widgets/CallToAction';
import CommunityMonitorCTA, {
  communityMonitorCTATitle,
} from 'components/admin/ContentBuilder/Widgets/CommunityMonitorCTA';
import communityMonitorMessages from 'components/admin/ContentBuilder/Widgets/CommunityMonitorCTA/messages';
import CustomPages, {
  customPagesTitle,
} from 'components/admin/ContentBuilder/Widgets/CustomPages';
import EventsList from 'components/admin/ContentBuilder/Widgets/Events';
import eventsMessages from 'components/admin/ContentBuilder/Widgets/Events/messages';
import FileAttachment from 'components/admin/ContentBuilder/Widgets/FileAttachment';
import FinishedOrArchived from 'components/admin/ContentBuilder/Widgets/FinishedOrArchived';
import finishedOrArchivedMessages from 'components/admin/ContentBuilder/Widgets/FinishedOrArchived/messages';
import FollowedItems, {
  followedItemsTitle,
} from 'components/admin/ContentBuilder/Widgets/FollowedItems';
import followedItemsMessages from 'components/admin/ContentBuilder/Widgets/FollowedItems/messages';
import HtmlBlockMultiloc from 'components/admin/ContentBuilder/Widgets/HtmlBlockMultiloc';
import IframeMultiloc from 'components/admin/ContentBuilder/Widgets/IframeMultiloc';
import ImageMultiloc from 'components/admin/ContentBuilder/Widgets/ImageMultiloc';
import ImageTextCards from 'components/admin/ContentBuilder/Widgets/ImageTextCards';
import OpenToParticipation, {
  openToParticipationTitle,
} from 'components/admin/ContentBuilder/Widgets/OpenToParticipation';
import PageLink from 'components/admin/ContentBuilder/Widgets/PageLink';
import Published, {
  publishedTitle,
} from 'components/admin/ContentBuilder/Widgets/Published';
import Selection, {
  selectionTitle,
} from 'components/admin/ContentBuilder/Widgets/Selection';
import Spotlight, {
  buttonTextDefault,
  spotlightTitle,
} from 'components/admin/ContentBuilder/Widgets/Spotlight';
import TextMultiloc from 'components/admin/ContentBuilder/Widgets/TextMultiloc';
import ThreeColumn from 'components/admin/ContentBuilder/Widgets/ThreeColumn';
import TwoColumn from 'components/admin/ContentBuilder/Widgets/TwoColumn';
import VideoEmbed, {
  videoEmbedTitle,
} from 'components/admin/ContentBuilder/Widgets/VideoEmbed';
import WhiteSpace from 'components/admin/ContentBuilder/Widgets/WhiteSpace';
import CustomPageBanner from 'components/CustomPageBuilder/Widgets/CustomPageBanner';
import ProjectsByFilter from 'components/CustomPageBuilder/Widgets/ProjectsByFilter';
import projectsMessages from 'components/CustomPageBuilder/Widgets/ProjectsByFilter/messages';
import messages from 'components/DescriptionBuilder/messages';
import InfoWithAccordions from 'components/DescriptionBuilder/Widgets/InfoWithAccordions';
import NewLabel from 'components/UI/NewLabel';

import {
  useIntl,
  useFormatMessageWithLocale,
  MessageDescriptor,
} from 'utils/cl-intl';
import { useParams } from 'utils/router';

const CustomPageBuilderToolbox = () => {
  const { customPageId } = useParams({ strict: false });
  const { data: customPage } = useCustomPageById(customPageId);
  // Page link lists the pages of one project, so only a project's own page can offer it.
  const isProjectPage = !!customPage?.data.attributes.project_id;
  const { formatMessage } = useIntl();
  const followEnabled = useFeatureFlag({ name: 'follow' });
  const communityMonitorEnabled = useFeatureFlag({
    name: 'community_monitor',
  });
  const isHtmlBlockMultilocEnabled = useFeatureFlag({
    name: 'html_block_in_content_builder',
  });
  // The legacy project-list section is itself the paid capability, unlike events where only
  // the filtering is, so the whole entry is gated.
  const filteredProjectsEnabled = useFeatureFlag({
    name: 'advanced_custom_pages',
  });
  const formatMessageWithLocale = useFormatMessageWithLocale();
  const appConfigurationLocales = useAppConfigurationLocales();

  if (!appConfigurationLocales || !formatMessageWithLocale) {
    return null;
  }

  const toMultiloc = (message: MessageDescriptor) => {
    return createMultiloc(appConfigurationLocales, (locale) => {
      return formatMessageWithLocale(locale, message);
    });
  };

  return (
    <Container>
      <Section>
        <DraggableElement
          id="e2e-draggable-custom-page-banner"
          component={
            <CustomPageBanner
              layout="full_width_banner_layout"
              headerMultiloc={{}}
              subheaderMultiloc={{}}
              overlayColor={null}
              overlayOpacity={null}
              ctaType="no_button"
              ctaTextMultiloc={{}}
              ctaUrl={null}
              image={{}}
            />
          }
          icon="image"
          label={formatMessage(heroBannerMessages.bannerWidgetTitle)}
        />
        {filteredProjectsEnabled && (
          <DraggableElement
            id="e2e-draggable-projects-by-filter"
            component={<ProjectsByFilter />}
            icon="projects"
            label={formatMessage(projectsMessages.filteredProjects)}
          />
        )}
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
          label={formatMessage(
            finishedOrArchivedMessages.finishedOrArchivedTitle
          )}
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
        {followEnabled && (
          <DraggableElement
            id="e2e-draggable-areas"
            component={<Areas titleMultiloc={toMultiloc(areasTitle)} />}
            icon="home"
            label={formatMessage(areasTitle)}
          />
        )}
        <DraggableElement
          id="e2e-draggable-published"
          component={<Published titleMultiloc={toMultiloc(publishedTitle)} />}
          icon="check-circle"
          label={formatMessage(publishedTitle)}
        />
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
          id="e2e-draggable-custom-pages"
          component={<CustomPages customPages={[]} />}
          icon="page"
          label={formatMessage(customPagesTitle)}
        />
        <DraggableElement
          id="e2e-draggable-events"
          component={
            // A project's page is about that project, as its project page is.
            isProjectPage ? (
              <EventsList
                source="currentProject"
                timeFilters={['upcoming', 'past']}
                limit="all"
              />
            ) : (
              <EventsList
                source="all"
                timeFilters={['upcoming']}
                limit={3}
                projectPublicationStatuses={['published']}
              />
            )
          }
          icon="calendar"
          label={formatMessage(eventsMessages.eventsListTitle)}
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
                title={toMultiloc(
                  communityMonitorMessages.communityMonitorCtaDefaultTitle
                )}
                description={toMultiloc(
                  communityMonitorMessages.communityMonitorCtaDefaultDescription
                )}
                surveyButtonText={toMultiloc(
                  communityMonitorMessages.communityMonitorCtaDefaultSurveyButtonText
                )}
              />
            }
            icon="survey"
            label={formatMessage(communityMonitorCTATitle)}
          />
        )}
      </Section>
      <Section>
        <DraggableElement
          id="e2e-draggable-text"
          component={<TextMultiloc />}
          icon="text"
          label={formatMessage(TextMultiloc.craft.custom.title)}
        />
        {isHtmlBlockMultilocEnabled && (
          <DraggableElement
            id="e2e-draggable-html-block"
            component={<HtmlBlockMultiloc />}
            icon="code"
            label={formatMessage(HtmlBlockMultiloc.craft.custom.title)}
            labelSuffix={<NewLabel expiryDate={new Date('2027-02-19')} />}
          />
        )}
        <DraggableElement
          id="e2e-draggable-white-space"
          component={<WhiteSpace size="small" />}
          icon="layout-white-space"
          label={formatMessage(WhiteSpace.craft.custom.title)}
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
          label={formatMessage(ButtonMultiloc.craft.custom.title)}
        />
        <DraggableElement
          id="e2e-draggable-image"
          component={<ImageMultiloc />}
          icon="image"
          label={formatMessage(ImageMultiloc.craft.custom.title)}
        />
        <DraggableElement
          id="e2e-draggable-iframe"
          component={
            <IframeMultiloc
              url=""
              height={500}
              tabletHeight={500}
              mobileHeight={500}
              hasError={false}
            />
          }
          icon="code"
          label={formatMessage(IframeMultiloc.craft.custom.title)}
        />
        <DraggableElement
          id="e2e-draggable-video-embed"
          component={<VideoEmbed markup="" />}
          icon="video"
          label={formatMessage(videoEmbedTitle)}
        />
        <DraggableElement
          id="e2e-draggable-file-attachment"
          component={<FileAttachment />}
          icon="paperclip"
          label={formatMessage(FileAttachment.craft.custom.title)}
        />
        {isProjectPage && (
          <DraggableElement
            id="e2e-draggable-page-link"
            component={<PageLink />}
            icon="file"
            label={formatMessage(PageLink.craft.custom.title)}
          />
        )}
        <DraggableElement
          id="e2e-draggable-two-column"
          component={<TwoColumn columnLayout="1-1" />}
          icon="layout-2column-1"
          label={formatMessage(TwoColumn.craft.custom.title)}
        />
        <DraggableElement
          id="e2e-draggable-three-column"
          component={<ThreeColumn />}
          icon="layout-3column"
          label={formatMessage(ThreeColumn.craft.custom.title)}
        />
        <DraggableElement
          id="e2e-draggable-accordion"
          component={<AccordionMultiloc title={{}} />}
          icon="accordion"
          label={formatMessage(AccordionMultiloc.craft.custom.title)}
        />
        <DraggableElement
          id="e2e-draggable-info-accordions"
          component={<InfoWithAccordions />}
          icon="section-info-accordion"
          label={formatMessage(messages.infoWithAccordions)}
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

export default CustomPageBuilderToolbox;
