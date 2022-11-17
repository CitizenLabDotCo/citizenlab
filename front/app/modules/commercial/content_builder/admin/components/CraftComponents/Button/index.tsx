import React from 'react';

// craft
import { useNode, useEditor } from '@craftjs/core';

// components
import { Radio, Box, Title, Input } from '@citizenlab/cl2-component-library';
import ButtonComponent from 'components/UI/Button';

// styles
import { colors } from 'utils/styleUtils';
import { darken } from 'polished';

// hooks
import { useTheme } from 'styled-components';

// intl
import messages from './messages';
import moduleMessages from '../../../messages';
import { injectIntl } from 'utils/cl-intl';

type ButtonProps = {
  text: string;
  url: string;
  type: 'primary' | 'secondary';
  alignment: string;
};

const Button = ({ text, url, type, alignment }: ButtonProps) => {
  const { enabled } = useEditor((state) => {
    return {
      enabled: state.options.enabled,
    };
  });

  // Links that are relative or of same hostname should open in same window
  let openInNewTab;
  if (url.includes(window.location.hostname)) {
    openInNewTab = false;
  } else if (!url.includes('.')) {
    openInNewTab = false;
  } else {
    openInNewTab = true;
  }

  return (
    <Box
      display="flex"
      minHeight="26px"
      justifyContent={
        alignment === 'center'
          ? 'center'
          : alignment === 'left'
          ? 'flex-start'
          : 'flex-end'
      }
    >
      {/* In edit view, show the button regardless if URL is set. The button should
          not be shown though in the live view if the URL is not set. */}
      {((enabled && text) || (text && url)) && (
        <ButtonComponent
          linkTo={url}
          openLinkInNewTab={openInNewTab}
          id="e2e-button"
          width={alignment === 'fullWidth' ? '100%' : 'auto'}
          buttonStyle={type}
          text={text}
        />
      )}
    </Box>
  );
};

const ButtonSettings = injectIntl(({ intl: { formatMessage } }) => {
  const {
    actions: { setProp },
    text,
    url,
    type,
    alignment,
  } = useNode((node) => ({
    text: node.data.props.text,
    url: node.data.props.url,
    type: node.data.props.type,
    alignment: node.data.props.alignment,
    id: node.id,
  }));
  const theme: any = useTheme();

  return (
    <Box background="#ffffff" marginBottom="20px">
      <Box flex="0 0 100%">
        <Input
          id="e2e-button-text-input"
          label={
            <Title variant="h4" as="h3">
              {formatMessage(messages.buttonText)}
            </Title>
          }
          placeholder={formatMessage(messages.button)}
          type="text"
          value={text}
          onChange={(value) => {
            setProp((props) => (props.text = value));
          }}
        />
      </Box>
      <Box flex="0 0 100%">
        <Input
          id="e2e-button-url-input"
          label={
            <Title variant="h4" as="h3">
              {formatMessage(messages.buttonUrl)}
            </Title>
          }
          placeholder={formatMessage(moduleMessages.urlPlaceholder)}
          type="text"
          value={url}
          onChange={(value) => {
            setProp((props) => (props.url = value));
          }}
        />
      </Box>
      <Title variant="h4" as="h3">
        {formatMessage(messages.buttonTypeRadioLabel)}
      </Title>
      <Radio
        onChange={(value) => {
          setProp((props) => (props.type = value));
        }}
        currentValue={type}
        id="style-primary"
        name="buttonStyle"
        value={'primary'}
        label={
          <Box
            bgColor={theme.colors.tenantPrimary}
            color="white"
            borderRadius="4px"
            px="8px"
            py="2px"
          >
            {formatMessage(messages.buttonTypePrimaryLabel)}
          </Box>
        }
        isRequired
      />
      <Radio
        onChange={(value) => {
          setProp((props) => (props.type = value));
        }}
        currentValue={type}
        id="style-secondary"
        name="buttonStyle"
        value="secondary"
        label={
          <Box
            borderRadius="4px"
            px="8px"
            py="2px"
            bgColor={colors.grey200}
            color={darken(0.1, colors.textSecondary)}
          >
            {formatMessage(messages.buttonTypeSecondaryLabel)}
          </Box>
        }
        isRequired
      />
      <Title variant="h4" as="h3">
        {formatMessage(messages.buttonAlignmentRadioLabel)}
      </Title>
      <Radio
        onChange={(value) => {
          setProp((props) => (props.alignment = value));
        }}
        currentValue={alignment}
        id="alignment-left"
        name="buttonAlignment"
        value={'left'}
        label={formatMessage(messages.alignmentLeft)}
        isRequired
      />
      <Radio
        onChange={(value) => {
          setProp((props) => (props.alignment = value));
        }}
        currentValue={alignment}
        id="alignment-center"
        name="buttonAlignment"
        value="center"
        label={formatMessage(messages.alignmentCenter)}
        isRequired
      />
      <Radio
        onChange={(value) => {
          setProp((props) => (props.alignment = value));
        }}
        currentValue={alignment}
        id="alignment-right"
        name="buttonAlignment"
        value="right"
        label={formatMessage(messages.alignmentRight)}
        isRequired
      />
      <Radio
        onChange={(value) => {
          setProp((props) => (props.alignment = value));
        }}
        currentValue={alignment}
        id="alignment-full-width"
        name="buttonAlignment"
        value="fullWidth"
        label={formatMessage(messages.alignmentFullWidth)}
        isRequired
      />
    </Box>
  );
});

Button.craft = {
  related: {
    settings: ButtonSettings,
  },
  custom: {
    title: messages.button,
  },
};

export default Button;
