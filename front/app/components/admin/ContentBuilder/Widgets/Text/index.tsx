import React from 'react';

// components
import QuillEditedContent from 'components/UI/QuillEditedContent';
import QuillEditor from 'components/UI/QuillEditor';
import PageBreakBox from '../PageBreakBox';
import { Box } from '@citizenlab/cl2-component-library';

// craft
import { useNode } from '@craftjs/core';

// i18n
import messages from './messages';

// hooks
import { useTheme } from 'styled-components';

interface Props {
  text: string;
}

const Text = ({ text }: Props) => {
  const theme = useTheme();

  return (
    <PageBreakBox id="e2e-text-box" minHeight="26px">
      <QuillEditedContent textColor={theme.colors.tenantText}>
        <div dangerouslySetInnerHTML={{ __html: text }} />
      </QuillEditedContent>
    </PageBreakBox>
  );
};

const TextSettings = () => {
  const {
    actions: { setProp },
    text,
  } = useNode((node) => ({
    text: node.data.props.text,
  }));

  return (
    <Box background="#ffffff" marginBottom="20px">
      <QuillEditor
        maxHeight="300px"
        noImages
        noVideos
        id="quill-editor"
        value={text}
        onChange={(value) => {
          setProp((props: Props) => (props.text = value));
        }}
      />
    </Box>
  );
};

Text.craft = {
  props: {
    text: '',
  },
  related: {
    settings: TextSettings,
  },
  custom: {
    title: messages.text,
  },
};

export default Text;
