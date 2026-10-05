import React, { lazy } from 'react';

import { Multiloc } from 'typings';
import { useTheme } from 'styled-components';

import useLocalize from 'hooks/useLocalize';

import QuillEditedContent from 'components/UI/QuillEditedContent';

import PageBreakBox from '../PageBreakBox';
import useCraftComponentDefaultPadding from '../../useCraftComponentDefaultPadding';

import messages from './messages';
import { BUILDER_CONTENT_MAX_WIDTH } from 'components/admin/ContentBuilder/constants';

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
      maxWidth={BUILDER_CONTENT_MAX_WIDTH}
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
