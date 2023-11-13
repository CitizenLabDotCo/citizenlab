import React from 'react';

// components
import QuillEditedContent from 'components/UI/QuillEditedContent';

// craft
import { ROOT_NODE, useNode } from '@craftjs/core';
import {
  Box,
  Accordion as AccordionComponent,
  Title,
  Toggle,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';

// hooks
import { useTheme } from 'styled-components';
import messages from './messages';
import { useIntl } from 'utils/cl-intl';
import { Multiloc } from 'typings';
import useLocalize from 'hooks/useLocalize';
import QuillMutilocWithLocaleSwitcher from 'components/UI/QuillEditor/QuillMultilocWithLocaleSwitcher';

interface AccordionProps {
  text: Multiloc;
  title: Multiloc;
  openByDefault?: boolean;
}

const Accordion = ({ text, title, openByDefault = false }: AccordionProps) => {
  const theme = useTheme();
  const localize = useLocalize();
  const isSmallerThanTablet = useBreakpoint('tablet');
  const { parent } = useNode((node) => ({
    parent: node.data.parent,
  }));

  return (
    <AccordionComponent
      maxWidth="1150px"
      margin="0 auto"
      px={isSmallerThanTablet && parent === ROOT_NODE ? '20px' : '0px'}
      isOpenByDefault={openByDefault}
      title={
        <Box id="e2e-accordion" display="flex">
          <Title variant="h3" color="tenantText">
            {localize(title)}
          </Title>
        </Box>
      }
    >
      <QuillEditedContent textColor={theme.colors.tenantText}>
        <div dangerouslySetInnerHTML={{ __html: localize(text) }} />
      </QuillEditedContent>
    </AccordionComponent>
  );
};

const AccordionSettings = () => {
  const { formatMessage } = useIntl();
  const {
    actions: { setProp },
    text,
    title,
    openByDefault,
  } = useNode((node) => ({
    text: node.data.props.text,
    title: node.data.props.title,
    openByDefault: node.data.props.openByDefault,
  }));

  return (
    <Box flexWrap="wrap" display="flex" gap="16px">
      <Box flex="0 1 100%">
        <InputMultilocWithLocaleSwitcher
          type="text"
          id="accordionTitleId"
          onChange={(value) => {
            setProp((props: AccordionProps) => (props.title = value));
          }}
          valueMultiloc={title}
          label={formatMessage(messages.accordionMultilocTitleLabel)}
        />
      </Box>
      <Box flex="0 1 100%" background="#ffffff">
        <QuillMutilocWithLocaleSwitcher
          label={formatMessage(messages.accordionMultilocTextLabel)}
          maxHeight="225px"
          noImages
          noVideos
          id="quill-editor"
          valueMultiloc={text}
          onChange={(value) => {
            setProp((props: AccordionProps) => (props.text = value));
          }}
        />
      </Box>
      <Box marginBottom="20px">
        <Toggle
          id="default-open-toggle"
          checked={openByDefault}
          onChange={() => {
            setProp(
              (props: AccordionProps) => (props.openByDefault = !openByDefault)
            );
          }}
          label={formatMessage(messages.accordionMultilocDefaultOpenLabel)}
        />
      </Box>
    </Box>
  );
};

Accordion.craft = {
  props: {
    title: {},
    text: {},
  },
  related: {
    settings: AccordionSettings,
  },
  custom: {
    title: messages.accordionMultiloc,
  },
};

export default Accordion;
