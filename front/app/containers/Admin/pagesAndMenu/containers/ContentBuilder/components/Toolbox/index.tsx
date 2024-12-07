import React from 'react';

import { useTheme } from 'styled-components';
import { SupportedLocale } from 'typings';

import useAppConfigurationLocales, {
  createMultiloc,
} from 'hooks/useAppConfigurationLocales';
import useFeatureFlag from 'hooks/useFeatureFlag';

import Container from 'components/admin/ContentBuilder/Toolbox/Container';
import DraggableElement from 'components/admin/ContentBuilder/Toolbox/DraggableElement';
import Section from 'components/admin/ContentBuilder/Toolbox/Section';
import AccordionMultiloc from 'components/admin/ContentBuilder/Widgets/AccordionMultiloc';
import ButtonMultiloc from 'components/admin/ContentBuilder/Widgets/ButtonMultiloc';
import IframeMultiloc from 'components/admin/ContentBuilder/Widgets/IframeMultiloc';
import ImageMultiloc from 'components/admin/ContentBuilder/Widgets/ImageMultiloc';
import ImageTextCards from 'components/admin/ContentBuilder/Widgets/ImageTextCards';
import ThreeColumn, {
  threeColumnTitle,
} from 'components/admin/ContentBuilder/Widgets/ThreeColumn';
import TwoColumn, {
  twoColumnTitle,
} from 'components/admin/ContentBuilder/Widgets/TwoColumn';
import WhiteSpace from 'components/admin/ContentBuilder/Widgets/WhiteSpace';

import {
  useIntl,
  useFormatMessageWithLocale,
  MessageDescriptor,
} from 'utils/cl-intl';

import messages from '../../messages';
import CallToAction, { callToActionTitle } from '../Widgets/CallToAction';
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
import OpenToParticipation, {
  openToParticipationTitle,
} from '../Widgets/OpenToParticipation';
import Projects, { projectsTitle } from '../Widgets/Projects';
import projectsMessages from '../Widgets/Projects/messages';
import Published, { publishedTitle } from '../Widgets/Published';
import Selection, { selectionTitle } from '../Widgets/Selection';
import Spotlight, {
  spotlightTitle,
  buttonTextDefault,
} from '../Widgets/Spotlight';
import TextMultiloc from '../Widgets/TextMultiloc';

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
  const newHomepageWidgetsEnabled = useFeatureFlag({
    name: 'new_homepage_widgets',
  });

  if (!appConfigurationLocales) return null;

  const toMultiloc = (message: MessageDescriptor) => {
    return createMultiloc(appConfigurationLocales, (locale) => {
      return formatMessageWithLocale(locale, message);
    });
  };

  return (
    <Container>
      <Section>
        <DraggableElement
          id="e2e-draggable-events"
          component={<Events />}
          icon="calendar"
          label={formatMessage(messages.eventsTitle)}
        />
        <DraggableElement
          id="e2e-draggable-image-text-cards"
          component={<ImageTextCards />}
          icon="section-image-text"
          label={formatMessage(messages.imageTextCards)}
        />
        {newHomepageWidgetsEnabled && (
          <DraggableElement
            id="e2e-draggable-spotlight"
            component={
              <Spotlight buttonTextMultiloc={toMultiloc(buttonTextDefault)} />
            }
            icon="flash"
            label={formatMessage(spotlightTitle)}
          />
        )}
        {newHomepageWidgetsEnabled && (
          <DraggableElement
            id="e2e-draggable-open-to-participation"
            component={
              <OpenToParticipation
                titleMultiloc={toMultiloc(openToParticipationTitle)}
              />
            }
            icon="projects"
            label={formatMessage(openToParticipationTitle)}
          />
        )}
        {newHomepageWidgetsEnabled && (
          <DraggableElement
            id="e2e-draggable-followed-items"
            component={
              <FollowedItems
                titleMultiloc={toMultiloc(followedItemsMessages.defaultTitle)}
              />
            }
            icon="projects"
            label={formatMessage(followedItemsTitle)}
          />
        )}
        {newHomepageWidgetsEnabled && (
          <DraggableElement
            id="e2e-draggable-published"
            component={<Published titleMultiloc={toMultiloc(publishedTitle)} />}
            icon="check-circle"
            label={formatMessage(publishedTitle)}
          />
        )}
        {newHomepageWidgetsEnabled && (
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
        )}
        {newHomepageWidgetsEnabled && (
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
        )}
        <DraggableElement
          id="e2e-draggable-call-to-action"
          component={
            <CallToAction primaryButtonText={{}} secondaryButtonText={{}} />
          }
          icon="button"
          label={formatMessage(callToActionTitle)}
        />
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
          id="e2e-draggable-projects"
          component={
            <Projects
              currentlyWorkingOnText={toMultiloc(
                projectsMessages.projectsTitlePlaceholder
              )}
            />
          }
          icon="projects"
          label={formatMessage(projectsTitle)}
        />
      </Section>
      <Section>
        <DraggableElement
          id="e2e-draggable-text-multiloc"
          component={<TextMultiloc text={{}} />}
          icon="text"
          label={formatMessage(TextMultiloc.craft.custom.title)}
        />
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
          component={<ImageMultiloc alt={{}} />}
          icon="image"
          label={formatMessage(ImageMultiloc.craft.custom.title)}
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
          label={formatMessage(IframeMultiloc.craft.custom.title)}
        />
        <DraggableElement
          id="e2e-draggable-accordion"
          component={<AccordionMultiloc title={{}} text={{}} />}
          icon="accordion"
          label={formatMessage(AccordionMultiloc.craft.custom.title)}
        />
        <DraggableElement
          id="e2e-draggable-two-column"
          component={<TwoColumn columnLayout="1-1" />}
          icon="layout-2column-1"
          label={formatMessage(twoColumnTitle)}
        />
        <DraggableElement
          id="e2e-draggable-two-column"
          component={<ThreeColumn />}
          icon="layout-3column"
          label={formatMessage(threeColumnTitle)}
        />
      </Section>
    </Container>
  );
};

export default HomepageBuilderToolbox;
