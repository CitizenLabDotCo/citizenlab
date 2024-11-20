import React from 'react';

import {
  Radio,
  Box,
  Input,
  Label,
  colors,
} from '@citizenlab/cl2-component-library';
import { useNode, useEditor } from '@craftjs/core';
import { darken } from 'polished';
import { RouteType } from 'routes';
import { useTheme } from 'styled-components';
import { Multiloc } from 'typings';

import useLocalize from 'hooks/useLocalize';

import ButtonComponent from 'components/UI/Button';
import InputMultilocWithLocaleSwitcherWrapper from 'components/UI/InputMultilocWithLocaleSwitcher';

import { injectIntl } from 'utils/cl-intl';

import sharedMessages from '../../messages';
import useCraftComponentDefaultPadding from '../../useCraftComponentDefaultPadding';

import messages from './messages';

type ButtonProps = {
  text: Multiloc;
  url: RouteType;
  type: 'primary' | 'secondary-outlined';
  alignment: string;
};

const Button = ({ text, url, type, alignment }: ButtonProps) => {
  const componentDefaultPadding = useCraftComponentDefaultPadding();
  const localize = useLocalize();
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
      maxWidth="1200px"
      margin="0 auto"
      px={componentDefaultPadding}
    >
      {/* In edit view, show the button regardless if URL is set. The button should
          not be shown though in the live view if the URL is not set. */}
      {/* TODO: Fix this the next time the file is edited. */}
      {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
      {((enabled && text) || (text && url)) && (
        <ButtonComponent
          linkTo={url}
          openLinkInNewTab={openInNewTab}
          className="e2e-button"
          width={alignment === 'fullWidth' ? '100%' : 'auto'}
          buttonStyle={type}
        >
          <span style={{ whiteSpace: 'normal' }}>{localize(text)}</span>
        </ButtonComponent>
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
  const theme = useTheme();

  return (
    <Box background="#ffffff" marginBottom="20px">
      <Box flex="0 0 100%">
        <InputMultilocWithLocaleSwitcherWrapper
          id="e2e-button-text-input"
          label={formatMessage(messages.buttonMultilocText)}
          placeholder={formatMessage(messages.buttonMultiloc)}
          type="text"
          valueMultiloc={text}
          onChange={(value) => {
            setProp((props: ButtonProps) => (props.text = value));
          }}
        />
      </Box>
      <Box flex="0 0 100%" mt="16px">
        <Input
          id="e2e-button-url-input"
          label={formatMessage(messages.buttonMultilocUrl)}
          placeholder={formatMessage(sharedMessages.urlPlaceholder)}
          type="text"
          value={url}
          onChange={(value: RouteType) => {
            setProp((props: ButtonProps) => (props.url = value));
          }}
        />
      </Box>
      <Box mt="16px">
        <Label>{formatMessage(messages.buttonMultilocTypeRadioLabel)}</Label>
      </Box>
      <Radio
        onChange={(value) => {
          setProp((props: ButtonProps) => (props.type = value));
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
            {formatMessage(messages.buttonMultilocTypePrimaryLabel)}
          </Box>
        }
        isRequired
      />
      <Radio
        onChange={(value) => {
          setProp((props: ButtonProps) => (props.type = value));
        }}
        currentValue={type}
        id="style-secondary"
        name="buttonStyle"
        value="secondary-outlined"
        label={
          <Box
            borderRadius="4px"
            px="8px"
            py="2px"
            bgColor={colors.grey200}
            color={darken(0.1, colors.textSecondary)}
          >
            {formatMessage(messages.buttonMultilocTypeSecondaryLabel)}
          </Box>
        }
        isRequired
      />
      <Box mt="16px">
        <Label>
          {formatMessage(messages.buttonMultilocAlignmentRadioLabel)}
        </Label>
      </Box>
      <Radio
        onChange={(value) => {
          setProp((props: ButtonProps) => (props.alignment = value));
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
          setProp((props: ButtonProps) => (props.alignment = value));
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
          setProp((props: ButtonProps) => (props.alignment = value));
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
          setProp((props: ButtonProps) => (props.alignment = value));
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
    title: messages.buttonMultiloc,
    noPointerEvents: true,
  },
};

export const buttonMultilocTitle = messages.buttonMultiloc;

export default Button;
