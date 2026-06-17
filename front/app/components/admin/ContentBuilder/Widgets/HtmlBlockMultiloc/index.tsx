import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';
import { Multiloc } from 'typings';

import useLocalize from 'hooks/useLocalize';
import TextAreaMultilocWithLocaleSwitcher from 'components/UI/TextAreaMultilocWithLocaleSwitcher';

import messages from './messages';
import styled from 'styled-components';

interface Props {
  html?: Multiloc;
}

const StyledBox = styled(Box)`
  textarea {
    font-family: 'monospace', monospace !important;
  }
`;

const HtmlBlockMultiloc = ({ html }: Props) => {
  const localize = useLocalize();

  return (
    <Box
      className="e2e-html-block"
      minHeight="26px"
      maxWidth="1200px"
      margin="0 auto"
    >
      <div dangerouslySetInnerHTML={{ __html: localize(html) }} />
    </Box>
  );
};

const HtmlBlockMultilocSettings = () => {
  const {
    actions: { setProp },
    html,
  } = useNode((node) => ({
    html: node.data.props.html,
  }));

  return (
    <StyledBox background="#ffffff" marginBottom="20px">
      <TextAreaMultilocWithLocaleSwitcher
        id="html-block-textarea"
        minRows={16}
        valueMultiloc={html}
        onChange={(value) => {
          setProp((props: Props) => (props.html = value));
        }}
      />
    </StyledBox>
  );
};

HtmlBlockMultiloc.craft = {
  props: {
    html: {},
  },
  related: {
    settings: HtmlBlockMultilocSettings,
  },
  custom: {
    title: messages.htmlBlockMultiloc,
  },
};

export default HtmlBlockMultiloc;
