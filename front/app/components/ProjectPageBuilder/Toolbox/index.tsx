import React from 'react';

import { Box, Icon, Text, colors } from '@citizenlab/cl2-component-library';

import descriptionMessages from 'containers/DescriptionBuilder/messages';

import Container from 'components/admin/ContentBuilder/Toolbox/Container';
import DraggableElement from 'components/admin/ContentBuilder/Toolbox/DraggableElement';
import Section from 'components/admin/ContentBuilder/Toolbox/Section';
import AboutBox from 'components/admin/ContentBuilder/Widgets/AboutBox';
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
import InfoWithAccordions from 'components/DescriptionBuilder/Widgets/InfoWithAccordions';
import builderMessages from 'components/ProjectPageBuilder/messages';

import { useIntl } from 'utils/cl-intl';

// Toolbox for the project page builder. The page's section order is frozen
// during the transition — the body rejects drops, so these widgets can only
// land inside the description section (matching what the legacy description
// editor can produce).
const ProjectPageBuilderToolbox = () => {
  const { formatMessage } = useIntl();

  return (
    <Container>
      <Box display="flex" gap="8px" p="12px" background={colors.grey100}>
        <Box flex="0 0 auto">
          <Icon
            name="lock"
            width="16px"
            height="16px"
            fill={colors.textSecondary}
          />
        </Box>
        <Text m="0px" color="textSecondary" fontSize="s">
          {formatMessage(builderMessages.toolboxLockedNote)}
        </Text>
      </Box>
      <Section>
        <DraggableElement
          id="e2e-draggable-image-text-cards"
          component={<ImageTextCards />}
          icon="section-image-text"
          label={formatMessage(descriptionMessages.imageTextCards)}
        />
        <DraggableElement
          id="e2e-draggable-info-accordions"
          component={<InfoWithAccordions />}
          icon="section-info-accordion"
          label={formatMessage(descriptionMessages.infoWithAccordions)}
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
          id="e2e-draggable-file-attachment"
          component={<FileAttachment />}
          icon="file"
          label={formatMessage(FileAttachment.craft.custom.title)}
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
          id="e2e-draggable-about-box"
          component={<AboutBox />}
          icon="info-solid"
          label={formatMessage(AboutBox.craft.custom.title)}
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

export default ProjectPageBuilderToolbox;
