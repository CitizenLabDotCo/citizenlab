import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';
import styled from 'styled-components';
import { Multiloc } from 'typings';

import useLocalize from 'hooks/useLocalize';
import { useLocation } from 'utils/router';

import TextAreaMultilocWithLocaleSwitcher from 'components/UI/TextAreaMultilocWithLocaleSwitcher';

import messages from './messages';

interface Props {
  html?: Multiloc;
}

const ContentWrapper = styled(Box)<{ isEditing: boolean }>`
  /**
* In edit mode, we disable pointer events for iframes contained within
* the HTMLBlock. An iframe is a separate browsing context: clicks occurring
* inside it never bubble up to the parent document, so craft.js never
* receives the mousedown/click event that selects the node.
* With \`pointer-events: none\`, the click passes through the iframe and reaches
* the wrapper connected by craft.js. This rule is applied only when the editor
* is active, so the iframe remains fully interactive in preview mode and on
* the public-facing side.
*/
  iframe {
    pointer-events: ${({ isEditing }) => (isEditing ? 'none' : 'auto')};
  }
`;

const StyledBox = styled(Box)`
  textarea {
    font-family: 'monospace', monospace !important;
  }
`;

const HtmlBlockMultiloc = ({ html }: Props) => {
  const localize = useLocalize();
  const { pathname } = useLocation();
  const enabled =
    pathname.includes('admin/project-page-builder') ||
    pathname.includes('admin/pages-menu');

  return (
    <ContentWrapper
      isEditing={enabled}
      className="e2e-html-block"
      minHeight="26px"
      maxWidth="1200px"
      margin="0 auto"
    >
      <div dangerouslySetInnerHTML={{ __html: localize(html) }} />
    </ContentWrapper>
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

export const htmlBlockMultilocTitle = messages.htmlBlockMultiloc;

export default HtmlBlockMultiloc;
