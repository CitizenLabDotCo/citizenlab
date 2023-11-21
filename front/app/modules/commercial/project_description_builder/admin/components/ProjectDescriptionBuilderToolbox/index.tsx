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
import TextMultiloc from 'components/admin/ContentBuilder/Widgets/TextMultiloc';
import TwoColumn from 'components/admin/ContentBuilder/Widgets/TwoColumn';
import ThreeColumn from 'components/admin/ContentBuilder/Widgets/ThreeColumn';
import ImageMultiloc from 'components/admin/ContentBuilder/Widgets/ImageMultiloc';
import IframeMultiloc from 'components/admin/ContentBuilder/Widgets/IframeMultiloc';
import AboutBox from 'components/admin/ContentBuilder/Widgets/AboutBox';
import AccordionMultiloc from 'components/admin/ContentBuilder/Widgets/AccordionMultiloc';
import WhiteSpace from 'components/admin/ContentBuilder/Widgets/WhiteSpace';
import ButtonMultiloc from 'components/admin/ContentBuilder/Widgets/ButtonMultiloc';
import InfoWithAccordions from '../CraftSections/InfoWithAccordions';
import ImageTextCards from 'components/admin/ContentBuilder/Widgets/ImageTextCards';

// types
import { Locale } from 'typings';

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
        id="e2e-draggable-about-box"
        component={<AboutBox />}
        icon="info-solid"
        label={formatMessage(AboutBox.craft.custom.title)}
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
