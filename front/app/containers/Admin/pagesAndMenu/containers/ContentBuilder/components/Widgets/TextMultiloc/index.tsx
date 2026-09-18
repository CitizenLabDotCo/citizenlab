import React, { lazy } from 'react';

import { useTheme } from 'styled-components';
import { Multiloc } from 'typings';

import useLocalize from 'hooks/useLocalize';

import useCraftComponentDefaultPadding from 'components/admin/ContentBuilder/useCraftComponentDefaultPadding';
import PageBreakBox from 'components/admin/ContentBuilder/Widgets/PageBreakBox';
import messages from 'components/admin/ContentBuilder/Widgets/TextMultiloc/messages';
import QuillEditedContent from 'components/UI/QuillEditedContent';

import { DEFAULT_Y_PADDING } from '../constants';

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
      className="e2e-text-box"
      minHeight="26px"
      maxWidth="1200px"
      margin="0 auto"
      px={craftComponentDefaultPadding}
      py={DEFAULT_Y_PADDING}
    >
      <QuillEditedContent textColor={theme.colors.tenantText}>
        <div dangerouslySetInnerHTML={{ __html: value }} />
      </QuillEditedContent>
    </PageBreakBox>
  );
};

// Lazy, as the rich text editor is only needed in the builder, not on the homepage.
const Settings = lazy(() => import('./Settings'));

TextMultiloc.craft = {
  props: {
    text: {},
  },
  related: {
    settings: Settings,
  },
};

export const textMultilocTitle = messages.textMultiloc;

export default TextMultiloc;
