import React, { useRef, useEffect, useState } from 'react';

import { debounce } from 'lodash-es';
import Quill, { RangeStatic } from 'quill';

import 'quill/dist/quill.snow.css';
import { useIntl } from 'utils/cl-intl';

import { configureQuill } from './configureQuill';
import { createQuill } from './createQuill';
import StyleContainer from './StyleContainer';
import Toolbar from './Toolbar';

export interface Props {
  id: string;
  value?: string;
  label?: string | JSX.Element | null;
  labelTooltipText?: string | JSX.Element | null;
  noToolbar?: boolean;
  noImages?: boolean;
  noVideos?: boolean;
  noAlign?: boolean;
  limitedTextFormatting?: boolean;
  maxHeight?: string;
  minHeight?: string;
  withCTAButton?: boolean;
  onChange?: (html: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

configureQuill();

const QuillEditor = ({
  id,
  value,
  noAlign,
  noToolbar,
  noImages,
  noVideos,
  limitedTextFormatting,
  maxHeight,
  minHeight,
  withCTAButton,
  onChange,
  onBlur,
  onFocus,
}: Props) => {
  const [editor, setEditor] = useState<Quill | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { formatMessage } = useIntl();
  const [isButtonsMenuVisible, setIsButtonsMenuVisible] = useState(false);
  const [focussed, setFocussed] = useState(false);

  const toolbarId = !noToolbar ? `ql-editor-toolbar-${id}` : undefined;

  // Initialize Quill
  // https://quilljs.com/playground/react
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const editorContainer = container.appendChild(
      container.ownerDocument.createElement('div')
    );

    const quill = createQuill(editorContainer, {
      id,
      toolbarId,
      noImages,
      noVideos,
      noAlign,
      limitedTextFormatting,
      withCTAButton,
      onBlur,
    });

    if (value) {
      // Hack to convert HTML to Delta
      const delta = quill.clipboard.convert(value as any);
      quill.setContents(delta);
    }

    setEditor(quill);

    return () => {
      container.innerHTML = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle text and focus changes
  useEffect(() => {
    if (!editor) return;

    // Convert Delta back to HTML
    const textChangeHandler = () => {
      const html =
        editor.root.innerHTML === '<p><br></p>' ? '' : editor.root.innerHTML;

      onChange?.(html);
    };

    const debouncedTextChangeHandler = debounce(textChangeHandler, 100);

    // Not sure why we handle focus like this, but seems to work
    const focusHandler = (range: RangeStatic, oldRange: RangeStatic) => {
      if (range === null && oldRange !== null) {
        setFocussed(false);
        onBlur?.();
      } else if (range !== null && oldRange === null) {
        setFocussed(true);
        onFocus?.();
      }
    };

    editor.on('text-change', debouncedTextChangeHandler);
    editor.on('selection-change', focusHandler);

    return () => {
      editor.off('text-change', debouncedTextChangeHandler);
      editor.off('selection-change', focusHandler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  const className = focussed ? 'focus' : '';

  return (
    <StyleContainer
      maxHeight={maxHeight}
      minHeight={minHeight}
      className={className}
      onMouseLeave={() => {}} // TOOD
    >
      {toolbarId && (
        <Toolbar
          id={toolbarId}
          limitedTextFormatting={limitedTextFormatting}
          withCTAButton={withCTAButton}
          isButtonsMenuVisible={isButtonsMenuVisible}
          noImages={noImages}
          noVideos={noVideos}
          noAlign={noAlign}
          editor={editor}
          setIsButtonsMenuVisible={setIsButtonsMenuVisible}
        />
      )}
      <div>
        <div ref={containerRef} />
      </div>
    </StyleContainer>
  );
};

export default QuillEditor;
