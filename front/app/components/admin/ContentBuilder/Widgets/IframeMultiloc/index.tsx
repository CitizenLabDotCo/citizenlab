import React from 'react';

import {
  Box,
  IconTooltip,
  Input,
  Text,
  Label,
} from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';
import { SupportedLocale, Multiloc } from 'typings';

import useLocalize from 'hooks/useLocalize';

import { CONTENT_BUILDER_ERROR_EVENT } from 'components/admin/ContentBuilder/constants';
import Error from 'components/UI/Error';
import InputMultilocWithLocaleSwitcherWrapper from 'components/UI/InputMultilocWithLocaleSwitcher';

import { injectIntl } from 'utils/cl-intl';
import eventEmitter from 'utils/eventEmitter';
import { isValidUrl } from 'utils/validate';

import sharedMessages from '../../messages';
import useCraftComponentDefaultPadding from '../../useCraftComponentDefaultPadding';

import messages from './messages';

interface Props {
  url: string;
  hasError: boolean;
  errorType?: string;
  title?: Multiloc;
  selectedLocale: SupportedLocale;
}

const IframeMultiloc = ({ url, hasError, title }: Props) => {
  const localize = useLocalize();
  const componentDefaultPadding = useCraftComponentDefaultPadding();

  return (
    <Box
      className="e2e-content-builder-iframe-component"
      minHeight="26px"
      maxWidth="1200px"
      margin="0 auto"
      px={componentDefaultPadding}
    >
      {!hasError && url && (
        <iframe
          src={url}
          title={localize(title)}
          width="100%"
          style={{
            border: '0px',
            // This is the new, modern way to set aspect ratio.
            // It replaces the need for a fixed height or a padding trick.
            aspectRatio: '16/9',
          }}
        />
      )}
    </Box>
  );
};

const IframeSettings = injectIntl(({ intl: { formatMessage } }) => {
  const {
    actions: { setProp },
    url,
    id,
    hasError,
    errorType,
    title,
    selectedLocale,
  } = useNode((node) => ({
    url: node.data.props.url,
    id: node.id,
    title: node.data.props.title,
    hasError: node.data.props.hasError,
    errorType: node.data.props.errorType,
    selectedLocale: node.data.props.selectedLocale,
  }));

  const handleChange = (value: string) => {
    setProp((props: Props) => {
      props.url = value;
    });
  };

  const handleBlur = () => {
    const validation = isValidUrl(url);

    setProp((props: Props) => {
      props.errorType = 'invalidUrl';
      props.hasError = !validation;
    });

    eventEmitter.emit(CONTENT_BUILDER_ERROR_EVENT, {
      [id]: { hasError: !validation, selectedLocale },
    });
  };

  return (
    <Box flexWrap="wrap" display="flex" gap="16px" marginBottom="20px">
      <Text variant="bodyM">{formatMessage(messages.iframeDescription)}</Text>
      <Box flex="0 0 100%">
        <Input
          id="e2e-content-builder-iframe-url-input"
          labelTooltipText={formatMessage(messages.embedIframeUrlLabelTooltip)}
          label={formatMessage(messages.embedIframeUrlLabel)}
          placeholder={formatMessage(sharedMessages.urlPlaceholder)}
          type="text"
          value={url}
          onChange={(value) => {
            handleChange(value);
          }}
          onBlur={handleBlur}
        />
        {hasError && errorType === 'invalidUrl' && (
          <Error
            marginTop="4px"
            text={formatMessage(messages.iframeInvalidUrlErrorMessage)}
          />
        )}
      </Box>
      <Box flex="0 0 100%">
        <Label htmlFor="e2e-content-builder-iframe-title-input">
          <span>
            {formatMessage(messages.embedIframeTitleLabel)}{' '}
            <IconTooltip
              display="inline"
              icon="info-solid"
              content={formatMessage(messages.embedIframeTitleTooltip)}
            />
          </span>
        </Label>
        <InputMultilocWithLocaleSwitcherWrapper
          type="text"
          id="e2e-content-builder-iframe-title-input"
          onChange={(value) => {
            setProp((props: Props) => (props.title = value));
          }}
          valueMultiloc={title}
        />
      </Box>
    </Box>
  );
});

IframeMultiloc.craft = {
  props: {
    url: '',
  },
  related: {
    settings: IframeSettings,
  },
  custom: {
    title: messages.url,
    noPointerEvents: true,
  },
};

export const iframeTitle = messages.url;

export default IframeMultiloc;
