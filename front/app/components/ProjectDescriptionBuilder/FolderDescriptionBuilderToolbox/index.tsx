import React from 'react';

import { SupportedLocale } from 'typings';

import useFeatureFlag from 'hooks/useFeatureFlag';

import messages from 'containers/ProjectDescriptionBuilder/messages';

import Container from 'components/admin/ContentBuilder/Toolbox/Container';
import DraggableElement from 'components/admin/ContentBuilder/Toolbox/DraggableElement';
import Section from 'components/admin/ContentBuilder/Toolbox/Section';
import AccordionMultiloc from 'components/admin/ContentBuilder/Widgets/AccordionMultiloc';
import ButtonMultiloc from 'components/admin/ContentBuilder/Widgets/ButtonMultiloc';
import FileAttachment from 'components/admin/ContentBuilder/Widgets/FileAttachment';
import IframeMultiloc from 'components/admin/ContentBuilder/Widgets/IframeMultiloc';
import ImageMultiloc from 'components/admin/ContentBuilder/Widgets/ImageMultiloc';
import ImageTextCards from 'components/admin/ContentBuilder/Widgets/ImageTextCards';
import TextMultiloc from 'components/admin/ContentBuilder/Widgets/TextMultiloc';
import ThreeColumn from 'components/admin/ContentBuilder/Widgets/ThreeColumn';
import TwoColumn from 'components/admin/ContentBuilder/Widgets/TwoColumn';
import WhiteSpace from 'components/admin/ContentBuilder/Widgets/WhiteSpace';

import InfoWithAccordions from '../CraftSections/InfoWithAccordions';
import Published from 'containers/Admin/pagesAndMenu/containers/ContentBuilder/components/Widgets/Published';
import {
  MessageDescriptor,
  useFormatMessageWithLocale,
  useIntl,
} from 'utils/cl-intl';
import Selection from 'containers/Admin/pagesAndMenu/containers/ContentBuilder/components/Widgets/Selection';
import Spotlight, {
  spotlightTitle,
} from 'containers/Admin/pagesAndMenu/containers/ContentBuilder/components/Widgets/Spotlight';
import useAppConfigurationLocales, {
  createMultiloc,
} from 'hooks/useAppConfigurationLocales';

type FolderDescriptionBuilderToolboxProps = {
  selectedLocale: SupportedLocale;
  folderId: string;
};

const FolderDescriptionBuilderToolbox = ({
  selectedLocale,
  folderId,
}: FolderDescriptionBuilderToolboxProps) => {
  const { formatMessage } = useIntl();
  const formatMessageWithLocale = useFormatMessageWithLocale();
  const appConfigurationLocales = useAppConfigurationLocales();
  const isDataRepositoryEnabled = useFeatureFlag({
    name: 'data_repository',
  });

  if (!appConfigurationLocales || !formatMessageWithLocale) {
    return null;
  }

  const toMultiloc = (message: MessageDescriptor) => {
    return createMultiloc(appConfigurationLocales, (locale) => {
      return formatMessageWithLocale(locale, message);
    });
  };

  return (
    <Container
      className="
    intercom-product-tour-project-description-content-builder-building-blocks-sidebar
    "
    >
      <Section>
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
        {isDataRepositoryEnabled && (
          <DraggableElement
            id="e2e-draggable-file-attachment"
            component={<FileAttachment />}
            icon="file"
            label={formatMessage(FileAttachment.craft.custom.title)}
          />
        )}
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
      </Section>
    </Container>
  );
};

export default FolderDescriptionBuilderToolbox;
