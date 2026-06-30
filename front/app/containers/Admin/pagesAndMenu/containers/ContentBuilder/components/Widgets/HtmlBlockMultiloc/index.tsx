import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';
import { Multiloc } from 'typings';

import useLocalize from 'hooks/useLocalize';
import messages from 'components/admin/ContentBuilder/Widgets/HtmlBlockMultiloc/messages';
import TextAreaMultilocWithLocaleSwitcher from 'components/UI/TextAreaMultilocWithLocaleSwitcher';
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
      data-cy="e2e-html-block"
      minHeight="40px"
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
    <StyledBox background={colors.white} marginBottom="20px">
      <TextAreaMultilocWithLocaleSwitcher
        id="html-block"
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
};

export const htmlBlockMultilocTitle = messages.htmlBlockMultiloc;

export default HtmlBlockMultiloc;
