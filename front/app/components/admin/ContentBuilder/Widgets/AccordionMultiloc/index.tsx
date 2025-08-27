import React from 'react';

import {
  Box,
  Accordion as AccordionComponent,
  Title,
  Toggle,
} from '@citizenlab/cl2-component-library';
import { useNode, Element } from '@craftjs/core';
import { useTheme } from 'styled-components';
import { Multiloc } from 'typings';

import useLocalize from 'hooks/useLocalize';

import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';
import QuillMutilocWithLocaleSwitcher from 'components/UI/QuillEditor/QuillMultilocWithLocaleSwitcher';

import { useIntl } from 'utils/cl-intl';

import useCraftComponentDefaultPadding from '../../useCraftComponentDefaultPadding';
import Container from '../Container';

import messages from './messages';

interface AccordionProps {
  text?: Multiloc; // Keep for backward compatibility during migration
  title: Multiloc;
  openByDefault?: boolean;
  children?: React.ReactNode; // For canvas mode
}

const Accordion = ({
  text,
  title,
  openByDefault = false,
  children,
}: AccordionProps) => {
  const theme = useTheme();
  const localize = useLocalize();
  const componentDefaultPadding = useCraftComponentDefaultPadding();

  return (
    <AccordionComponent
      w="auto"
      maxWidth="1200px"
      margin={`0 ${
        componentDefaultPadding === '0px' ? 'auto' : componentDefaultPadding
      }`}
      isOpenByDefault={openByDefault}
      title={
        <Box className="e2e-accordion" display="flex">
          <Title variant="h3" color="tenantText">
            {localize(title)}
          </Title>
        </Box>
      }
    >
      {/* <QuillEditedContent textColor={theme.colors.tenantText}>
        <div dangerouslySetInnerHTML={{ __html: localize(text) }} />
      </QuillEditedContent> */}
      <Box>
        <Element id="accordion-content" is={Container} canvas />
      </Box>
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
          valueMultiloc={text || {}}
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
    hasChildren: true,
  },
  rules: {
    canMoveIn: (incomingNodes) => {
      // Allow all components to be moved into accordion when in canvas mode
      return true;
    },
  },
};

export const accordionMultilocTitle = messages.accordionMultiloc;

export default Accordion;
