import React from 'react';

// craft
import { useNode } from '@craftjs/core';

// components
import {
  Radio,
  Box,
  Button as ButtonComponent,
  Title,
  Input,
  Toggle,
  ButtonStyles,
} from '@citizenlab/cl2-component-library';

// intl
import messages from '../../../messages';
import { injectIntl } from 'utils/cl-intl';

type ButtonProps = {
  text: string;
  url: string;
  opensInNewTab: boolean;
  type: ButtonStyles;
  alignment: string;
};

const Button = ({ text, url, opensInNewTab, type, alignment }: ButtonProps) => {
  const openUrl = (url: string) => {
    const targetValue = opensInNewTab ? '_blank' : '_self';
    window.open(url, targetValue);
  };

  return (
    <Box
      display="flex"
      justifyContent={
        alignment === 'center'
          ? 'center'
          : alignment === 'left'
          ? 'flex-start'
          : 'flex-end'
      }
    >
      <ButtonComponent
        onClick={() => openUrl(url)}
        id="e2e-button"
        width={alignment === 'fullWidth' ? '100%' : 'auto'}
        buttonStyle={type}
        text={text}
      />
    </Box>
  );
};

const ButtonSettings = injectIntl(({ intl: { formatMessage } }) => {
  const {
    actions: { setProp },
    text,
    url,
    opensInNewTab,
    type,
    alignment,
  } = useNode((node) => ({
    text: node.data.props.text,
    url: node.data.props.url,
    opensInNewTab: node.data.props.opensInNewTab,
    type: node.data.props.type,
    alignment: node.data.props.alignment,
  }));
  return (
    <Box background="#ffffff" marginBottom="20px">
      <Box flex="0 0 100%">
        <Input
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
          label={
            <Title variant="h4" as="h3">
              {formatMessage(messages.buttonUrl)}
            </Title>
          }
          placeholder={formatMessage(messages.urlPlaceholder)}
          type="text"
          value={url}
          onChange={(value) => {
            setProp((props) => (props.url = value));
          }}
        />
      </Box>
      <Box mt="20px" mb="20px">
        <Toggle
          id="toggle-open-new-tab-window"
          checked={opensInNewTab}
          onChange={() => {
            setProp((props) => (props.opensInNewTab = !opensInNewTab));
          }}
          label={formatMessage(messages.openInTabOrWindow)}
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
          <ButtonComponent
            text={formatMessage(messages.buttonTypePrimaryLabel)}
            id="e2e-button"
            buttonStyle="primary"
            fontSize="small"
            paddingX="8px"
            paddingY="0px"
            style={{ pointerEvents: 'none' }}
          />
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
          <ButtonComponent
            text={formatMessage(messages.buttonTypeSecondaryLabel)}
            id="e2e-button"
            buttonStyle="secondary"
            fontSize="small"
            paddingX="8px"
            paddingY="0px"
            style={{ pointerEvents: 'none' }}
          />
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
};

export default Button;
