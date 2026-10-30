import React from 'react';

import { Box, colors, fontSizes } from '@citizenlab/cl2-component-library';
import ReactMarkdown from 'react-markdown';
import styled from 'styled-components';

// Keeps the model's Markdown compact in the narrow panel; the component library has no
// props for the nested elements Markdown produces.
const MarkdownContainer = styled.div`
  color: ${colors.textPrimary};
  font-size: ${fontSizes.base}px;
  line-height: 1.5;
  overflow-wrap: anywhere;

  p,
  ul,
  ol {
    margin: 0 0 8px;
  }

  ul,
  ol {
    padding-left: 20px;
  }

  > :last-child {
    margin-bottom: 0;
  }
`;

// Only the formatting the prompt asks for. An image in a reply would load right away, so
// text injected through an attached file could send the chat to the image's URL.
const ALLOWED_ELEMENTS = ['p', 'strong', 'em', 'ul', 'ol', 'li', 'br', 'code'];

type Props = {
  content: string;
};

// react-markdown escapes raw HTML; don't add rehype-raw here, the content comes from the
// model.
const AssistantMessage = ({ content }: Props) => (
  <Box maxWidth="100%">
    <MarkdownContainer>
      <ReactMarkdown allowedElements={ALLOWED_ELEMENTS} unwrapDisallowed>
        {content}
      </ReactMarkdown>
    </MarkdownContainer>
  </Box>
);

export default AssistantMessage;
