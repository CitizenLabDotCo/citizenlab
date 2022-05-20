import React from 'react';

// components
import QuillEditedContent from 'components/UI/QuillEditedContent';
import QuillEditor from 'components/UI/QuillEditor';

// craft
import { useNode } from '@craftjs/core';
import {
  Box,
  Accordion,
  Title,
  IconTooltip,
  Input,
  Label,
  Toggle,
} from '@citizenlab/cl2-component-library';

// hooks
import { useTheme } from 'styled-components';

// intl
import messages from '../../../messages';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';

const SimpleAccordion = ({
  text,
  title,
  openByDefault,
  showTooltip,
  tooltipContent,
}) => {
  const theme: any = useTheme();

  return (
    <Box>
      <Accordion
        isOpenByDefault={openByDefault}
        title={
          <Box display="flex">
            <Title variant="h3">{title}</Title>
            {showTooltip && (
              <IconTooltip
                m="8px"
                mt="16px"
                icon="info"
                content={tooltipContent}
              />
            )}
          </Box>
        }
      >
        <QuillEditedContent textColor={theme.colorText}>
          <div dangerouslySetInnerHTML={{ __html: text }} />
        </QuillEditedContent>
      </Accordion>
    </Box>
  );
};

const AccordionSettings = injectIntl(({ intl: { formatMessage } }) => {
  const {
    actions: { setProp },
    text,
    title,
    showTooltip,
    openByDefault,
    tooltipContent,
  } = useNode((node) => ({
    text: node.data.props.text,
    title: node.data.props.title,
    showTooltip: node.data.props.showTooltip,
    openByDefault: node.data.props.openByDefault,
    tooltipContent: node.data.props.tooltipContent,
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
      <Box display="flex" gap="16px" flex="0 1 100%">
        <Toggle
          checked={showTooltip}
          onChange={() => {
            setProp((props) => (props.showTooltip = !showTooltip));
          }}
        />
        <Box mt="4px">
          <Label>
            <FormattedMessage {...messages.accordionTooltipToggleLabel} />
          </Label>
        </Box>
      </Box>
      {showTooltip && (
        <Box flex="0 1 100%">
          <Input
            type="text"
            onChange={(value) => {
              setProp((props) => (props.tooltipContent = value));
            }}
            value={tooltipContent}
            label={formatMessage(messages.accordionTooltipContentLabel)}
          />
        </Box>
      )}
      <Box display="flex" gap="16px" marginBottom="20px" flex="0 1 100%">
        <Toggle
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

SimpleAccordion.craft = {
  props: {
    text: '',
  },
  related: {
    settings: AccordionSettings,
  },
};

export default SimpleAccordion;
