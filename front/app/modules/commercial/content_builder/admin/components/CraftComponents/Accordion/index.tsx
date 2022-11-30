import React from 'react';

// components
import QuillEditedContent from 'components/UI/QuillEditedContent';
import QuillEditor from 'components/UI/QuillEditor';

// craft
import { useNode } from '@craftjs/core';
import {
  Box,
  Accordion as AccordionComponent,
  Title,
  Input,
  Toggle,
} from '@citizenlab/cl2-component-library';

// hooks
import { useTheme } from 'styled-components';

// intl
import messages from '../../../messages';
import { injectIntl } from 'utils/cl-intl';

const Accordion = ({ text, title, openByDefault }) => {
  const theme = useTheme();

  return (
    <AccordionComponent
      isOpenByDefault={openByDefault}
      title={
        <Box id="e2e-accordion" display="flex">
          <Title variant="h3" color="tenantText">
            {title}
          </Title>
        </Box>
      }
    >
      <QuillEditedContent textColor={theme.colors.tenantText}>
        <div dangerouslySetInnerHTML={{ __html: text }} />
      </QuillEditedContent>
    </AccordionComponent>
  );
};

const AccordionSettings = injectIntl(({ intl: { formatMessage } }) => {
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
        <Input
          type="text"
          id="accordionTitleId"
          onChange={(value) => {
            setProp((props) => (props.title = value));
          }}
          value={title}
          label={formatMessage(messages.accordionTitleLabel)}
        />
      </Box>
      <Box flex="0 1 100%" background="#ffffff">
        <QuillEditor
          label={formatMessage(messages.accordionTextLabel)}
          maxHeight="225px"
          noImages
          noVideos
          id="quill-editor"
          value={text}
          onChange={(value) => {
            setProp((props) => (props.text = value));
          }}
        />
      </Box>
      <Box marginBottom="20px">
        <Toggle
          id="default-open-toggle"
          checked={openByDefault}
          onChange={() => {
            setProp((props) => (props.openByDefault = !openByDefault));
          }}
          label={formatMessage(messages.accordionDefaultOpenLabel)}
        />
      </Box>
    </Box>
  );
});

Accordion.craft = {
  props: {
    text: '',
  },
  related: {
    settings: AccordionSettings,
  },
};

export default Accordion;
