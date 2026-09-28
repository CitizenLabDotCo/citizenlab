import React, { lazy } from 'react';

import { useTheme } from 'styled-components';
import { Multiloc } from 'typings';

import useLocalize from 'hooks/useLocalize';

import QuillEditedContent from 'components/UI/QuillEditedContent';

import useCraftComponentDefaultPadding from '../../useCraftComponentDefaultPadding';
import PageBreakBox from '../PageBreakBox';

import messages from './messages';

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
    >
      <QuillEditedContent textColor={theme.colors.tenantText}>
        <div dangerouslySetInnerHTML={{ __html: value }} />
      </QuillEditedContent>
    </PageBreakBox>
  );
};

// Lazy, as the rich text editor is only needed in the builder, not on the pages
// showing the widget.
const Settings = lazy(() => import('./Settings'));

TextMultiloc.craft = {
  props: {
    text: {},
  },
  related: {
    settings: Settings,
  },
  custom: {
    title: messages.textMultiloc,
  },
};

export default TextMultiloc;
