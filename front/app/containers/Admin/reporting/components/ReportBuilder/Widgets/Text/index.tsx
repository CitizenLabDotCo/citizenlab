import React from 'react';

// components
import QuillEditedContent from 'components/UI/QuillEditedContent';
import QuillEditor from 'components/UI/QuillEditor';
import PageBreakBox from 'components/admin/ContentBuilder/Widgets/PageBreakBox';
import { Box } from '@citizenlab/cl2-component-library';

// craft
import { useNode } from '@craftjs/core';

// i18n
import messages from 'containers/Admin/reporting/components/ReportBuilder/Widgets/Text/messages';

// hooks
import { useTheme } from 'styled-components';
import useReportDefaultPadding from 'containers/Admin/reporting/hooks/useReportDefaultPadding';

interface Props {
  text: string;
}

const Text = ({ text }: Props) => {
  const theme = useTheme();
  const px = useReportDefaultPadding();

  return (
    <PageBreakBox className="e2e-text-box" minHeight="26px" px={px}>
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
