import React from 'react';

import { SupportedLocale } from 'typings';

import useAppConfigurationLocales, {
  createMultiloc,
} from 'hooks/useAppConfigurationLocales';

import Published from 'containers/Admin/pagesAndMenu/containers/ContentBuilder/components/Widgets/Published';
import Selection from 'containers/Admin/pagesAndMenu/containers/ContentBuilder/components/Widgets/Selection';
import Spotlight, {
  spotlightTitle,
} from 'containers/Admin/pagesAndMenu/containers/ContentBuilder/components/Widgets/Spotlight';
import messages from 'containers/DescriptionBuilder/messages';

import Container from 'components/admin/ContentBuilder/Toolbox/Container';
import DraggableElement from 'components/admin/ContentBuilder/Toolbox/DraggableElement';
import Section from 'components/admin/ContentBuilder/Toolbox/Section';
import AccordionMultiloc from 'components/admin/ContentBuilder/Widgets/AccordionMultiloc';
import ButtonMultiloc from 'components/admin/ContentBuilder/Widgets/ButtonMultiloc';
import IframeMultiloc from 'components/admin/ContentBuilder/Widgets/IframeMultiloc';
import ImageMultiloc from 'components/admin/ContentBuilder/Widgets/ImageMultiloc';
import ImageTextCards from 'components/admin/ContentBuilder/Widgets/ImageTextCards';
import TextMultiloc from 'components/admin/ContentBuilder/Widgets/TextMultiloc';
import ThreeColumn from 'components/admin/ContentBuilder/Widgets/ThreeColumn';
import TwoColumn from 'components/admin/ContentBuilder/Widgets/TwoColumn';
import WhiteSpace from 'components/admin/ContentBuilder/Widgets/WhiteSpace';
import FolderFiles, {
  folderFilesTitle,
} from 'components/DescriptionBuilder/Widgets/FolderFiles';
import FolderTitle, {
  folderTitleTitle,
} from 'components/DescriptionBuilder/Widgets/FolderTitle';
import InfoWithAccordions from 'components/DescriptionBuilder/Widgets/InfoWithAccordions';

import {
  MessageDescriptor,
  useFormatMessageWithLocale,
  useIntl,
} from 'utils/cl-intl';

type FolderDescriptionBuilderToolboxProps = {
  selectedLocale: SupportedLocale;
  folderId: string;
};

const FolderDescriptionBuilderToolbox = ({
  folderId,
}: FolderDescriptionBuilderToolboxProps) => {
  const { formatMessage } = useIntl();
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

  // Note: Some widgets here have folder specific labels
  return (
    <Container
      className="
    intercom-product-tour-project-description-content-builder-building-blocks-sidebar
    "
    >
      <Section>
        <DraggableElement
          id="e2e-draggable-folder-title"
          component={<FolderTitle folderId={folderId} />}
          icon="text"
          label={formatMessage(folderTitleTitle)}
        />
        <DraggableElement
          id="e2e-draggable-published"
          component={
            <Published
              titleMultiloc={toMultiloc(messages.publishedProjects)}
              folderId={folderId}
            />
          }
          icon="check-circle"
          label={formatMessage(messages.publishedProjects)}
        />
        <DraggableElement
          id="e2e-draggable-selection"
          component={
            <Selection
              titleMultiloc={toMultiloc(messages.selectedProjects)}
              adminPublicationIds={[]}
            />
          }
          icon="folder-outline"
          label={formatMessage(messages.selectedProjects)}
        />
        <DraggableElement
          id="e2e-draggable-spotlight"
          component={
            <Spotlight
              buttonTextMultiloc={toMultiloc(spotlightTitle)}
              hideAvatars={false}
            />
          }
          icon="flash"
          label={formatMessage(spotlightTitle)}
        />
        <DraggableElement
          id="e2e-draggable-folder-files"
          component={<FolderFiles folderId={folderId} />}
          icon="paperclip"
          label={formatMessage(folderFilesTitle)}
        />
      </Section>
      <Section>
        <DraggableElement
          id="e2e-draggable-image-text-cards"
          component={<ImageTextCards />}
          icon="section-image-text"
          label={formatMessage(messages.imageTextCards)}
        />
        <DraggableElement
          id="e2e-draggable-info-accordions"
          component={<InfoWithAccordions />}
          icon="section-info-accordion"
          label={formatMessage(messages.infoWithAccordions)}
        />
      </Section>
      <Section>
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
      </Section>
      <Section>
        <DraggableElement
          id="e2e-draggable-text"
          component={<TextMultiloc />}
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
          component={<ImageMultiloc />}
          icon="image"
          label={formatMessage(ImageMultiloc.craft.custom.title)}
        />
        <DraggableElement
          id="e2e-draggable-iframe"
          component={<IframeMultiloc url="" height={500} hasError={false} />}
          icon="code"
          label={formatMessage(IframeMultiloc.craft.custom.title)}
        />
        <DraggableElement
          id="e2e-draggable-accordion"
          component={<AccordionMultiloc title={{}} />}
          icon="accordion"
          label={formatMessage(AccordionMultiloc.craft.custom.title)}
        />
      </Section>
    </Container>
  );
};

export default FolderDescriptionBuilderToolbox;
