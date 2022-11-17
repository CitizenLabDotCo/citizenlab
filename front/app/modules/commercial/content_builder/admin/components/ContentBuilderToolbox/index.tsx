import React from 'react';

// Router
import { useParams } from 'react-router-dom';

// i18n
import messages from '../../messages';
import accordionMessages from '../CraftComponents/Accordion/messages';
import { FormattedMessage, useIntl } from 'utils/cl-intl';

// components
import Container from 'components/ContentBuilder/Toolbox/Container';
import SectionTitle from 'components/ContentBuilder/Toolbox/SectionTitle';
import DraggableElement from 'components/ContentBuilder/Toolbox/DraggableElement';
import Text from '../CraftComponents/Text';
import TwoColumn from '../CraftComponents/TwoColumn';
import ThreeColumn from '../CraftComponents/ThreeColumn';
import Image from '../CraftComponents/Image';
import Iframe from '../CraftComponents/Iframe';
import AboutBox from '../CraftComponents/AboutBox';
import Accordion from '../CraftComponents/Accordion';
import WhiteSpace from '../CraftComponents/WhiteSpace';
import Button from '../CraftComponents/Button';
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
        component={<TwoColumn columnLayout="1-1" id="twoColumn" />}
        icon="layout-2column-1"
        label={formatMessage(messages.twoColumn)}
      />
      <DraggableElement
        id="e2e-draggable-three-column"
        component={<ThreeColumn />}
        icon="layout-3column"
        label={formatMessage(messages.threeColumn)}
      />
      <DraggableElement
        id="e2e-draggable-white-space"
        component={<WhiteSpace size="small" />}
        icon="layout-white-space"
        label={formatMessage(messages.whiteSpace)}
      />
      <SectionTitle>
        <FormattedMessage {...messages.content} />
      </SectionTitle>
      <DraggableElement
        id="e2e-draggable-text"
        component={<Text text={formatMessage(messages.textValue)} />}
        icon="text"
        label={formatMessage(messages.text)}
      />
      <DraggableElement
        id="e2e-draggable-button"
        component={
          <Button
            text={formatMessage(messages.button)}
            url={''}
            type={'primary'}
            alignment={'left'}
          />
        }
        icon="button"
        label={formatMessage(messages.button)}
      />
      <DraggableElement
        id="e2e-draggable-image"
        component={<Image alt="" />}
        icon="image"
        label={formatMessage(messages.image)}
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
        label={formatMessage(messages.url)}
      />
      <DraggableElement
        id="e2e-draggable-about-box"
        component={<AboutBox projectId={projectId} />}
        icon="info-solid"
        label={formatMessage(messages.aboutBox)}
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
        label={formatMessage(messages.accordion)}
      />
    </Container>
  );
};

export default ContentBuilderToolbox;
