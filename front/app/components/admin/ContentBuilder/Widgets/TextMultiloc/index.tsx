import React from 'react';

// components
import QuillEditedContent from 'components/UI/QuillEditedContent';
import QuillMutilocWithLocaleSwitcher from 'components/UI/QuillEditor/QuillMultilocWithLocaleSwitcher';
import PageBreakBox from '../PageBreakBox';
import { Box } from '@citizenlab/cl2-component-library';

// craft
import { useNode } from '@craftjs/core';
import useCraftComponentDefaultPadding from '../../useCraftComponentDefaultPadding';

// i18n
import messages from './messages';

// hooks
import { useTheme } from 'styled-components';
import { Multiloc } from 'typings';
import useLocalize from 'hooks/useLocalize';

interface Props {
  text?: Multiloc;
}

const TextMultiloc = ({ text }: Props) => {
  const craftComponentDefaultPadding = useCraftComponentDefaultPadding();
  const theme = useTheme();
  const localize = useLocalize();

  const value = localize(text);

  return (
    <PageBreakBox
      id="e2e-text-box"
      minHeight="26px"
      maxWidth="1150px"
      margin="0 auto"
      px={craftComponentDefaultPadding}
    >
      <QuillEditedContent textColor={theme.colors.tenantText}>
        <div dangerouslySetInnerHTML={{ __html: value }} />
      </QuillEditedContent>
    </PageBreakBox>
  );
};

const TextMultilocSettings = () => {
  const {
    actions: { setProp },
    text,
  } = useNode((node) => ({
    text: node.data.props.text,
  }));

  return (
    <Box background="#ffffff" marginBottom="20px">
      <QuillMutilocWithLocaleSwitcher
        maxHeight="300px"
        noImages
        noVideos
        id="quill-editor"
        valueMultiloc={text}
        onChange={(value) => {
          setProp((props: Props) => (props.text = value));
        }}
      />
    </Box>
  );
};

TextMultiloc.craft = {
  props: {
    text: {},
  },
  related: {
    settings: TextMultilocSettings,
  },
  custom: {
    title: messages.textMultiloc,
  },
};

export default TextMultiloc;
