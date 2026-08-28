import React from 'react';

import useFeatureFlag from 'hooks/useFeatureFlag';

import messages from 'containers/DescriptionBuilder/messages';

import Container from 'components/admin/ContentBuilder/Toolbox/Container';
import DraggableElement from 'components/admin/ContentBuilder/Toolbox/DraggableElement';
import Section from 'components/admin/ContentBuilder/Toolbox/Section';
import AccordionMultiloc from 'components/admin/ContentBuilder/Widgets/AccordionMultiloc';
import ButtonMultiloc from 'components/admin/ContentBuilder/Widgets/ButtonMultiloc';
import FileAttachment from 'components/admin/ContentBuilder/Widgets/FileAttachment';
import HtmlBlockMultiloc from 'components/admin/ContentBuilder/Widgets/HtmlBlockMultiloc';
import IframeMultiloc from 'components/admin/ContentBuilder/Widgets/IframeMultiloc';
import ImageMultiloc from 'components/admin/ContentBuilder/Widgets/ImageMultiloc';
import ImageTextCards from 'components/admin/ContentBuilder/Widgets/ImageTextCards';
import PageLink from 'components/admin/ContentBuilder/Widgets/PageLink';
import TextMultiloc from 'components/admin/ContentBuilder/Widgets/TextMultiloc';
import ThreeColumn from 'components/admin/ContentBuilder/Widgets/ThreeColumn';
import TwoColumn from 'components/admin/ContentBuilder/Widgets/TwoColumn';
import WhiteSpace from 'components/admin/ContentBuilder/Widgets/WhiteSpace';
import CustomPageTitle from 'components/CustomPageBuilder/Widgets/CustomPageTitle';
import EventsByProjects from 'components/CustomPageBuilder/Widgets/EventsByProjects';
import ProjectsByFilter from 'components/CustomPageBuilder/Widgets/ProjectsByFilter';
import InfoWithAccordions from 'components/DescriptionBuilder/Widgets/InfoWithAccordions';
import NewLabel from 'components/UI/NewLabel';

import { useIntl } from 'utils/cl-intl';

// Its own list, not the description toolbox's: that one carries the Participation Box, which
// is project-only, and the two diverge further as custom page widgets land (see TAN-8556).
const CustomPageBuilderToolbox = () => {
  const { formatMessage } = useIntl();
  const isHtmlBlockMultilocEnabled = useFeatureFlag({
    name: 'html_block_in_content_builder',
  });
  const projectStaticPagesEnabled = useFeatureFlag({
    name: 'project_static_pages',
  });
  const advancedCustomPagesEnabled = useFeatureFlag({
    name: 'advanced_custom_pages',
  });

  return (
    <Container>
      <Section>
        {/* Deletable, so it needs a way back. It can only be dropped into the body — ROOT
            refuses drops — and normalizeCustomPageLayout hoists it to its slot from there. */}
        <DraggableElement
          id="e2e-draggable-custom-page-title"
          component={<CustomPageTitle />}
          icon="text"
          label={formatMessage(CustomPageTitle.craft.custom.title)}
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
        {advancedCustomPagesEnabled && (
          <DraggableElement
            id="e2e-draggable-projects-by-filter"
            component={<ProjectsByFilter />}
            icon="projects"
            label={formatMessage(ProjectsByFilter.craft.custom.title)}
          />
        )}
        <DraggableElement
          id="e2e-draggable-events-by-projects"
          component={<EventsByProjects />}
          icon="calendar"
          label={formatMessage(EventsByProjects.craft.custom.title)}
        />
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
          id="e2e-draggable-file-attachment"
          component={<FileAttachment />}
          icon="paperclip"
          label={formatMessage(FileAttachment.craft.custom.title)}
        />
        {projectStaticPagesEnabled && (
          <DraggableElement
            id="e2e-draggable-page-link"
            component={<PageLink />}
            icon="file"
            label={formatMessage(PageLink.craft.custom.title)}
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
              tabletHeight={500}
              mobileHeight={500}
              hasError={false}
            />
          }
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

export default CustomPageBuilderToolbox;
