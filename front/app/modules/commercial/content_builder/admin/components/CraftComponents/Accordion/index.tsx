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
  Label,
  Toggle,
} from '@citizenlab/cl2-component-library';

// hooks
import { useTheme } from 'styled-components';

// intl
import messages from '../../../messages';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';

const Accordion = ({ text, title, openByDefault }) => {
  const theme: any = useTheme();

  return (
    <Box id="e2e-accordion">
      <AccordionComponent
        isOpenByDefault={openByDefault}
        title={
          <Box display="flex">
            <Title variant="h3">{title}</Title>
          </Box>
        }
      >
        <QuillEditedContent textColor={theme.colorText}>
          <div dangerouslySetInnerHTML={{ __html: text }} />
        </QuillEditedContent>
      </AccordionComponent>
    </Box>
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
        <Label>{formatMessage(messages.accordionTextLabel)}</Label>
        <QuillEditor
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
      <Box display="flex" gap="16px" marginBottom="20px" flex="0 1 100%">
        <Toggle
          id="e2e-default-open-toggle"
          checked={openByDefault}
          onChange={() => {
            setProp((props) => (props.openByDefault = !openByDefault));
          }}
        />
        <Box mt="4px">
          <Label>
            <FormattedMessage {...messages.accordionDefaultOpenLabel} />
          </Label>
        </Box>
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
