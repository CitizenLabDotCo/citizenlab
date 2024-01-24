import React from 'react';

// components
import QuillEditedContent from 'components/UI/QuillEditedContent';
import QuillMutilocWithLocaleSwitcher from 'components/UI/QuillEditor/QuillMultilocWithLocaleSwitcher';
import PageBreakBox from 'components/admin/ContentBuilder/Widgets/PageBreakBox';
import { Box } from '@citizenlab/cl2-component-library';

// craft
import { useNode } from '@craftjs/core';
import useReportDefaultPadding from 'containers/Admin/reporting/hooks/useReportDefaultPadding';

// i18n
import messages from 'components/admin/ContentBuilder/Widgets/TextMultiloc/messages';

// hooks
import { useTheme } from 'styled-components';
import { Multiloc } from 'typings';
import useLocalize from 'hooks/useLocalize';

interface Props {
  text?: Multiloc;
}

const TextMultiloc = ({ text }: Props) => {
  const craftComponentDefaultPadding = useReportDefaultPadding();
  const theme = useTheme();
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
};

export const textMultilocTitle = messages.textMultiloc;

export default TextMultiloc;
