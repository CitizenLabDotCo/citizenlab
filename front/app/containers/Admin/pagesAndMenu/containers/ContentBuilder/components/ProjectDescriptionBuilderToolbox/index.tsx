import React from 'react';

// Router

// i18n
import contentBuilderMessages from 'components/admin/ContentBuilder/messages';
import messages from '../../messages';
import { FormattedMessage, useIntl } from 'utils/cl-intl';

// components
import Container from 'components/admin/ContentBuilder/Toolbox/Container';
import SectionTitle from 'components/admin/ContentBuilder/Toolbox/SectionTitle';
import DraggableElement from 'components/admin/ContentBuilder/Toolbox/DraggableElement';

// widgets
import Text from 'components/admin/ContentBuilder/Widgets/Text';
import TwoColumn from 'components/admin/ContentBuilder/Widgets/TwoColumn';
import ThreeColumn from 'components/admin/ContentBuilder/Widgets/ThreeColumn';
import ImageMultiloc from 'components/admin/ContentBuilder/Widgets/ImageMultiloc';
import IframeMultiloc from 'components/admin/ContentBuilder/Widgets/IframeMultiloc';
import AccordionMultiloc from 'components/admin/ContentBuilder/Widgets/AccordionMultiloc';
import WhiteSpace from 'components/admin/ContentBuilder/Widgets/WhiteSpace';
import ButtonMultiloc from 'components/admin/ContentBuilder/Widgets/ButtonMultiloc';
import ImageTextCards from '../CraftSections/ImageTextCards';
import TextMultiloc from 'components/admin/ContentBuilder/Widgets/TextMultiloc';

// types
import { Locale } from 'typings';
import HomepageBanner from '../CraftSections/HomepageBanner';
import Projects from '../CraftSections/Projects';

type ProjectDescriptionBuilderToolboxProps = {
  selectedLocale: Locale;
};

const ProjectDescriptionBuilderToolbox = ({
  selectedLocale,
}: ProjectDescriptionBuilderToolboxProps) => {
  const { formatMessage } = useIntl();

  return (
    <Container>
      <SectionTitle>
        <FormattedMessage {...messages.sections} />
      </SectionTitle>
      <DraggableElement
        id="e2e-draggable-info-accordions"
        component={
          <HomepageBanner
            homepageSettings={{
              top_info_section_enabled: false,
              top_info_section_multiloc: {},
              bottom_info_section_enabled: false,
              bottom_info_section_multiloc: {},
              events_widget_enabled: false,
              projects_enabled: true,
              projects_header_multiloc: {},
              banner_avatars_enabled: false,
              banner_layout: 'full_width_banner_layout',
              banner_signed_in_header_multiloc: {},
              banner_cta_signed_in_text_multiloc: {},
              banner_cta_signed_in_type: 'no_button',
              banner_cta_signed_in_url: null,
              banner_signed_out_header_multiloc: {},
              banner_signed_out_subheader_multiloc: {},
              banner_signed_out_header_overlay_color: '#0A5159',
              banner_signed_out_header_overlay_opacity: 90,
              banner_cta_signed_out_text_multiloc: {},
              banner_cta_signed_out_type: 'sign_up_button',
              banner_cta_signed_out_url: null,
              pinned_admin_publication_ids: [],
              header_bg: {
                large:
                  'http://localhost:4000/uploads/c72c5211-8e03-470b-9564-04ec0a8c322b/home_page/header_bg/5bda79bf-dc89-4a27-95c5-6d1982b15693/large_c20073fe-056e-432c-a614-6b92892caf86.jpg',
                medium:
                  'http://localhost:4000/uploads/c72c5211-8e03-470b-9564-04ec0a8c322b/home_page/header_bg/5bda79bf-dc89-4a27-95c5-6d1982b15693/medium_c20073fe-056e-432c-a614-6b92892caf86.jpg',
                small:
                  'http://localhost:4000/uploads/c72c5211-8e03-470b-9564-04ec0a8c322b/home_page/header_bg/5bda79bf-dc89-4a27-95c5-6d1982b15693/small_c20073fe-056e-432c-a614-6b92892caf86.jpg',
              },
            }}
          />
        }
        icon="section-info-accordion"
        label={'Homepage Banner'}
      />
      <DraggableElement
        id="e2e-draggable-projects"
        component={<Projects />}
        icon="section-info-accordion"
        label={'Projects'}
      />
      <DraggableElement
        id="e2e-draggable-image-text-cards"
        component={<ImageTextCards />}
        icon="section-image-text"
        label={formatMessage(messages.imageTextCards)}
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
        label={formatMessage(Text.craft.custom.title)}
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

export default ProjectDescriptionBuilderToolbox;
