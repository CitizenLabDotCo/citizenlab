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

  h1,
  h2,
  h3,
  h4 {
    font-size: ${fontSizes.m}px;
    margin: 12px 0 4px;
  }

  > :last-child {
    margin-bottom: 0;
  }
`;

type Props = {
  content: string;
};

// react-markdown escapes raw HTML and drops unsafe link protocols by default; don't add
// rehype-raw here, the content comes from the model.
const AssistantMessage = ({ content }: Props) => (
  <Box maxWidth="100%">
    <MarkdownContainer>
      <ReactMarkdown>{content}</ReactMarkdown>
    </MarkdownContainer>
  </Box>
);

export default AssistantMessage;
