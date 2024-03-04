import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';
import useReportDefaultPadding from 'containers/Admin/reporting/hooks/useReportDefaultPadding';
import { Multiloc } from 'typings';

import PageBreakBox from 'components/admin/ContentBuilder/Widgets/PageBreakBox';
import messages from 'components/admin/ContentBuilder/Widgets/TextMultiloc/messages';
import QuillEditedContent from 'components/UI/QuillEditedContent';
import QuillMutilocWithLocaleSwitcher from 'components/UI/QuillEditor/QuillMultilocWithLocaleSwitcher';

import useLocalize from 'hooks/useLocalize';

export interface Props {
  text?: Multiloc;
}

const TextMultiloc = ({ text }: Props) => {
  const craftComponentDefaultPadding = useReportDefaultPadding();
  const localize = useLocalize();

  const value = localize(text);

  return (
    <PageBreakBox
      className="e2e-text-box"
      minHeight="26px"
      maxWidth="1200px"
      margin="0 auto"
      px={craftComponentDefaultPadding}
    >
      <QuillEditedContent textColor={colors.textPrimary}>
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
};

export const textMultilocTitle = messages.textMultiloc;

export default TextMultiloc;
