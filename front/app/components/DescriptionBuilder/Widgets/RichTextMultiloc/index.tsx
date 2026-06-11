import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { UserComponent, useNode } from '@craftjs/core';
import { useTheme } from 'styled-components';
import { Multiloc } from 'typings';

import useLocalize from 'hooks/useLocalize';

import useCraftComponentDefaultPadding from 'components/admin/ContentBuilder/useCraftComponentDefaultPadding';
import PageBreakBox from 'components/admin/ContentBuilder/Widgets/PageBreakBox';
import QuillEditedContent from 'components/UI/QuillEditedContent';
import QuillMultilocWithLocaleSwitcher from 'components/UI/QuillEditor/QuillMultilocWithLocaleSwitcher';

import messages from './messages';

interface Props {
  text?: Multiloc;
}

/**
 * Migration-only "bridge" widget. Holds legacy WYSIWYG (Quill) description HTML
 * at full fidelity — inline images, videos and buttons render exactly as they
 * did in the classic editor. It is registered in the description-builder
 * resolver but intentionally NOT added to the toolbox, so admins cannot create
 * new ones; only the WYSIWYG→Content Builder migration produces them.
 *
 * Unlike the standard `TextMultiloc` widget, its settings editor keeps images
 * and videos enabled (no `noImages`/`noVideos`), so admins can keep editing the
 * migrated rich content. Inline legacy images resolve via the backend
 * `TextImageService` serializer pass (see `Layout::TEXT_CRAFTJS_NODE_TYPES`).
 */
const RichTextMultiloc: UserComponent<Props> = ({ text }) => {
  const craftComponentDefaultPadding = useCraftComponentDefaultPadding();
  const theme = useTheme();
  const localize = useLocalize();

  const value = localize(text);

  return (
    <PageBreakBox
      className="e2e-rich-text-box"
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

const RichTextMultilocSettings = () => {
  const {
    actions: { setProp },
    text,
  } = useNode((node) => ({
    text: node.data.props.text,
  }));

  return (
    <Box background="#ffffff" marginBottom="20px">
      <QuillMultilocWithLocaleSwitcher
        maxHeight="300px"
        id="quill-editor"
        valueMultiloc={text}
        onChange={(value) => {
          setProp((props: Props) => (props.text = value));
        }}
      />
    </Box>
  );
};

RichTextMultiloc.craft = {
  props: {
    text: {},
  },
  related: {
    settings: RichTextMultilocSettings,
  },
  custom: {
    title: messages.richTextMultiloc,
  },
};

export default RichTextMultiloc;
