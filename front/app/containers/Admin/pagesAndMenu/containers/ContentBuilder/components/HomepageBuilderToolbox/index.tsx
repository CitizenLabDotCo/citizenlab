import React from 'react';

import { SupportedLocale } from 'typings';

import useAppConfigurationLocales, {
  createMultiloc,
} from 'hooks/useAppConfigurationLocales';

import contentBuilderMessages from 'components/admin/ContentBuilder/messages';
import Container from 'components/admin/ContentBuilder/Toolbox/Container';
import DraggableElement from 'components/admin/ContentBuilder/Toolbox/DraggableElement';
import SectionTitle from 'components/admin/ContentBuilder/Toolbox/SectionTitle';
import AccordionMultiloc from 'components/admin/ContentBuilder/Widgets/AccordionMultiloc';
import ButtonMultiloc from 'components/admin/ContentBuilder/Widgets/ButtonMultiloc';
import IframeMultiloc from 'components/admin/ContentBuilder/Widgets/IframeMultiloc';
import ImageMultiloc from 'components/admin/ContentBuilder/Widgets/ImageMultiloc';
import ImageTextCards from 'components/admin/ContentBuilder/Widgets/ImageTextCards';
import TextMultiloc from 'components/admin/ContentBuilder/Widgets/TextMultiloc';
import ThreeColumn from 'components/admin/ContentBuilder/Widgets/ThreeColumn';
import TwoColumn from 'components/admin/ContentBuilder/Widgets/TwoColumn';
import WhiteSpace from 'components/admin/ContentBuilder/Widgets/WhiteSpace';

import {
  FormattedMessage,
  useIntl,
  useFormatMessageWithLocale,
  MessageDescriptor,
} from 'utils/cl-intl';

import messages from '../../messages';
import Events from '../CraftComponents/Events';
import Highlight from '../CraftComponents/Highlight';
import SpotlightProject, {
  spotlightProjectTitle,
  buttonTextDefault,
} from '../CraftComponents/SpotlightProject';

type HomepageBuilderToolboxProps = {
  selectedLocale: SupportedLocale;
};

const HomepageBuilderToolbox = ({
  selectedLocale,
}: HomepageBuilderToolboxProps) => {
  const { formatMessage } = useIntl();
  const formatMessageWithLocale = useFormatMessageWithLocale();
  const appConfigurationLocales = useAppConfigurationLocales();

  if (!appConfigurationLocales) return null;

  const toMultiloc = (message: MessageDescriptor) => {
    return createMultiloc(appConfigurationLocales, (locale) => {
      return formatMessageWithLocale(locale, message);
    });
  };

  return (
    <Container>
      <SectionTitle>
        <FormattedMessage {...messages.sections} />
      </SectionTitle>

      <DraggableElement
        id="e2e-draggable-events"
        component={<Events />}
        icon="calendar"
        label={formatMessage(messages.eventsTitle)}
      />
      <DraggableElement
        id="e2e-draggable-highlight"
        component={
          <Highlight primaryButtonText={{}} secondaryButtonText={{}} />
        }
        icon="flash"
        label={formatMessage(messages.highlightTitle)}
      />
      <DraggableElement
        id="e2e-draggable-image-text-cards"
        component={<ImageTextCards />}
        icon="section-image-text"
        label={formatMessage(messages.imageTextCards)}
      />
      <DraggableElement
        id="e2e-draggable-spotlight-project"
        component={
          <SpotlightProject
            buttonTextMultiloc={toMultiloc(buttonTextDefault)}
          />
        }
        icon="projects"
        label={formatMessage(spotlightProjectTitle)}
      />
      <SectionTitle>
        <FormattedMessage {...contentBuilderMessages.layout} />
      </SectionTitle>
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
        id="e2e-draggable-white-space"
        component={<WhiteSpace size="small" />}
        icon="layout-white-space"
        label={formatMessage(WhiteSpace.craft.custom.title)}
      />
      <SectionTitle>
        <FormattedMessage {...contentBuilderMessages.content} />
      </SectionTitle>
      <DraggableElement
        id="e2e-draggable-text-multiloc"
        component={<TextMultiloc text={{}} />}
        icon="text"
        label={formatMessage(TextMultiloc.craft.custom.title)}
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
    </Container>
  );
};

export default HomepageBuilderToolbox;
