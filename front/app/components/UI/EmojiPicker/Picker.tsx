import React from 'react';

import data from '@emoji-mart/data';
import EmojiMartPicker from '@emoji-mart/react';

interface Props {
  locale: string;
  onEmojiSelect: (emoji: { native: string }) => void;
}

// Separate module so the emoji-mart library and its data set load only when the
// picker is opened. Every widget in the content builder reaches this component
// through its settings panel, which would otherwise put emoji-mart in the
// bundle of any page that renders content-builder widgets.
const Picker = ({ locale, onEmojiSelect }: Props) => (
  <EmojiMartPicker
    data={data}
    perLine={8}
    locale={locale}
    onEmojiSelect={onEmojiSelect}
  />
);

export default Picker;
