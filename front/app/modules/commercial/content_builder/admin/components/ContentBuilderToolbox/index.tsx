import React from 'react';

// Router
import { useParams } from 'react-router-dom';

// i18n
import messages from '../../messages';
import accordionMessages from 'components/admin/ContentBuilder/Widgets/Accordion/messages';
import textMessages from 'components/admin/ContentBuilder/Widgets/Text/messages';
import { FormattedMessage, useIntl } from 'utils/cl-intl';

// components
import Container from 'components/admin/ContentBuilder/Toolbox/Container';
import SectionTitle from 'components/admin/ContentBuilder/Toolbox/SectionTitle';
import DraggableElement from 'components/admin/ContentBuilder/Toolbox/DraggableElement';

// widgets
import Text from 'components/admin/ContentBuilder/Widgets/Text';
import TwoColumn from 'components/admin/ContentBuilder/Widgets/TwoColumn';
import ThreeColumn from 'components/admin/ContentBuilder/Widgets/ThreeColumn';
import Image from 'components/admin/ContentBuilder/Widgets/Image';
import Iframe from 'components/admin/ContentBuilder/Widgets/Iframe';
import AboutBox from 'components/admin/ContentBuilder/Widgets/AboutBox';
import Accordion from 'components/admin/ContentBuilder/Widgets/Accordion';
import WhiteSpace from 'components/admin/ContentBuilder/Widgets/WhiteSpace';
import Button from 'components/admin/ContentBuilder/Widgets/Button';
import InfoWithAccordions from '../CraftSections/InfoWithAccordions';
import ImageTextCards from '../CraftSections/ImageTextCards';

// types
import { Locale } from 'typings';

type ContentBuilderToolboxProps = {
  selectedLocale: Locale;
};

const ContentBuilderToolbox = ({
  selectedLocale,
}: ContentBuilderToolboxProps) => {
  const { formatMessage } = useIntl();
  const { projectId } = useParams() as { projectId: string };

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
        component={<InfoWithAccordions projectId={projectId} />}
        icon="section-info-accordion"
        label={formatMessage(messages.infoWithAccordions)}
      />
      <SectionTitle>
        <FormattedMessage {...messages.layout} />
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
        <FormattedMessage {...messages.content} />
      </SectionTitle>
      <DraggableElement
        id="e2e-draggable-text"
        component={<Text text={formatMessage(textMessages.textValue)} />}
        icon="text"
        label={formatMessage(Text.craft.custom.title)}
      />
      <DraggableElement
        id="e2e-draggable-button"
        component={
          <Button
            text={formatMessage(Button.craft.custom.title)}
            url={''}
            type={'primary'}
            alignment={'left'}
          />
        }
        icon="button"
        label={formatMessage(Button.craft.custom.title)}
      />
      <DraggableElement
        id="e2e-draggable-image"
        component={<Image alt="" />}
        icon="image"
        label={formatMessage(Image.craft.custom.title)}
      />
      <DraggableElement
        id="e2e-draggable-iframe"
        component={
          <Iframe
            url=""
            height={500}
            hasError={false}
            selectedLocale={selectedLocale}
          />
        }
        icon="code"
        label={formatMessage(Iframe.craft.custom.title)}
      />
      <DraggableElement
        id="e2e-draggable-about-box"
        component={<AboutBox projectId={projectId} />}
        icon="info-solid"
        label={formatMessage(AboutBox.craft.custom.title)}
      />
      <DraggableElement
        id="e2e-draggable-accordion"
        component={
          <Accordion
            title={formatMessage(accordionMessages.accordionTitleValue)}
            text={formatMessage(accordionMessages.accordionTextValue)}
            openByDefault={false}
          />
        }
        icon="accordion"
        label={formatMessage(Accordion.craft.custom.title)}
      />
    </Container>
  );
};

export default ContentBuilderToolbox;
