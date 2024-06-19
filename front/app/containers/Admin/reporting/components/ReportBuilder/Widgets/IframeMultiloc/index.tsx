import React from 'react';

import {
  Box,
  IconTooltip,
  Input,
  Text,
  Label,
} from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';
import { Multiloc } from 'typings';

import useLocalize from 'hooks/useLocalize';

import contentBuilderMessages from 'components/admin/ContentBuilder/messages';
import messages from 'components/admin/ContentBuilder/Widgets/IframeMultiloc/messages';
import Error from 'components/UI/Error';
import InputMultilocWithLocaleSwitcherWrapper from 'components/UI/InputMultilocWithLocaleSwitcher';

import { useIntl } from 'utils/cl-intl';
import { isValidUrl } from 'utils/validate';

export interface Props {
  url: string;
  height: number;
  title?: Multiloc;
}

const IframeMultiloc = ({ url, height, title }: Props) => {
  const localize = useLocalize();

  return (
    <Box
      id="e2e-content-builder-iframe-component"
      minHeight="26px"
      maxWidth="1200px"
      margin="0 auto"
    >
      {url && (
        <iframe
          src={url}
          title={localize(title)}
          width="100%"
          height={height}
          style={{
            border: '0px',
          }}
        />
      )}
    </Box>
  );
};

const IframeSettings = () => {
  const { formatMessage } = useIntl();

  const {
    actions: { setProp },
    url,
    height,
    title,
  } = useNode((node) => ({
    url: node.data.props.url,
    height: node.data.props.height,
    id: node.id,
    title: node.data.props.title,
  }));

  const handleChange = (value: string) => {
    setProp((props: Props) => (props.url = value));
  };

  return (
    <Box flexWrap="wrap" display="flex" gap="16px" marginBottom="20px">
      <Text variant="bodyM">{formatMessage(messages.iframeDescription)}</Text>
      <Box flex="0 0 100%">
        <Input
          id="e2e-content-builder-iframe-url-input"
          labelTooltipText={formatMessage(messages.embedIframeUrlLabelTooltip)}
          label={formatMessage(messages.embedIframeUrlLabel)}
          placeholder={formatMessage(contentBuilderMessages.urlPlaceholder)}
          type="text"
          value={url}
          onChange={(value) => {
            handleChange(value);
          }}
        />
        {!isValidUrl(url) && (
          <Error
            marginTop="4px"
            text={formatMessage(messages.iframeInvalidUrlErrorMessage)}
          />
        )}
      </Box>
      <Box flex="0 0 100%">
        <Input
          labelTooltipText={formatMessage(
            messages.embedIframeHeightLabelTooltip
          )}
          label={formatMessage(messages.embedIframeHeightLabel)}
          placeholder={formatMessage(messages.iframeHeightPlaceholder)}
          type="number"
          value={height}
          onChange={(value) => {
            setProp((props) => (props.height = value));
          }}
        />
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
};

IframeMultiloc.craft = {
  props: {
    url: '',
    height: '',
    title: undefined,
  },
  related: {
    settings: IframeSettings,
  },
};

export const iframeMultilocTitle = messages.url;

export default IframeMultiloc;
