import React, { useEffect } from 'react';
import { isEmpty } from 'lodash-es';

// craft
import { useNode } from '@craftjs/core';

// components
import { Radio, Box, Title, Input } from '@citizenlab/cl2-component-library';
import Error from 'components/UI/Error';
import ButtonComponent from 'components/UI/Button';

// styles
import { colors } from 'utils/styleUtils';

// hooks
import { useTheme } from 'styled-components';

// intl
import messages from '../../../messages';
import { injectIntl } from 'utils/cl-intl';
import eventEmitter from 'utils/eventEmitter';
import { CONTENT_BUILDER_ERROR_EVENT } from '../../../containers';

// types
import { Locale } from 'typings';

type ButtonProps = {
  text: string;
  url: string;
  type: 'primary' | 'secondary';
  alignment: string;
  hasUrlError?: boolean;
  hasTextError?: boolean;
  hasError?: boolean;
  selectedLocale: Locale;
};

const Button = ({ text, url, type, alignment }: ButtonProps) => {
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
        linkTo={url}
        openLinkInNewTab={true}
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
    type,
    alignment,
    selectedLocale,
    id,
    hasUrlError,
    hasTextError,
    hasError,
  } = useNode((node) => ({
    text: node.data.props.text,
    url: node.data.props.url,
    type: node.data.props.type,
    alignment: node.data.props.alignment,
    selectedLocale: node.data.props.selectedLocale,
    id: node.id,
    hasUrlError: node.data.props.hasUrlError,
    hasTextError: node.data.props.hasTextError,
    hasError: node.data.props.hasError,
  }));

  useEffect(() => {
    eventEmitter.emit(CONTENT_BUILDER_ERROR_EVENT, {
      [id]: { hasError, selectedLocale },
    });
  }, [hasError, id, selectedLocale]);

  const theme: any = useTheme();

  const handleTextChange = (value: string) => {
    setProp((props) => (props.text = value));
    setProp((props) => (props.hasTextError = isEmpty(value)));
    const errorState = isEmpty(value) || hasUrlError;
    setProp((props) => (props.hasError = errorState));
    eventEmitter.emit(CONTENT_BUILDER_ERROR_EVENT, {
      [id]: { hasError: errorState, selectedLocale },
    });
  };

  const handleUrlChange = (value: string) => {
    setProp((props) => (props.url = value));
    setProp((props) => (props.hasUrlError = isEmpty(value)));
    const errorState = isEmpty(value) || hasTextError;
    setProp((props) => (props.hasError = errorState));
    eventEmitter.emit(CONTENT_BUILDER_ERROR_EVENT, {
      [id]: { hasError: errorState, selectedLocale },
    });
  };

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
            handleTextChange(value);
          }}
        />
        {hasTextError && (
          <Error
            marginTop="4px"
            text={formatMessage(messages.buttonTextErrorMessage)}
          />
        )}
      </Box>
      <Box flex="0 0 100%">
        <Input
          id="e2e-button-url-input"
          label={
            <Title variant="h4" as="h3">
              {formatMessage(messages.buttonUrl)}
            </Title>
          }
          placeholder={formatMessage(messages.urlPlaceholder)}
          type="text"
          value={url}
          onChange={(value) => {
            handleUrlChange(value);
          }}
        />
        {hasUrlError && (
          <Error
            marginTop="4px"
            text={formatMessage(messages.buttonUrlErrorMessage)}
          />
        )}
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
            id="e2e-button"
            bgColor={theme.colorMain}
            color={colors.adminLightText}
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
            id="e2e-button"
            borderRadius="4px"
            px="8px"
            py="2px"
            bgColor={colors.backgroundLightGrey}
            color={colors.text}
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
};

export default Button;
