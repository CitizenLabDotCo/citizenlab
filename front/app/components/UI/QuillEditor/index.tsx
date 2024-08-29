import React, { useRef, useEffect, useState, useCallback } from 'react';

import Quill, { RangeStatic } from 'quill';

import 'quill/dist/quill.snow.css';
import { useIntl } from 'utils/cl-intl';

import { configureQuill } from './configureQuill';
import { createQuill } from './createQuill';
import messages from './messages';
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

    // Not sure why we handle focus like this, but seems to work
    const focusHandler = (range: RangeStatic, oldRange: RangeStatic) => {
      if (range === null && oldRange !== null) {
        setFocussed(false);
      } else if (range !== null && oldRange === null) {
        setFocussed(true);
      }
    };

    editor.on('text-change', textChangeHandler);
    editor.on('selection-change', focusHandler);

    return () => {
      editor.off('text-change', textChangeHandler);
      editor.off('selection-change', focusHandler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  const handleCustomLink = useCallback(() => {
    if (!editor) return;

    const selection = editor.getSelection();

    if (selection && selection.length > 0) {
      const value = prompt(formatMessage(messages.customLinkPrompt));
      editor.format('button', value);
      setIsButtonsMenuVisible(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  const handleNormalLink = useCallback(() => {
    if (!editor) return;

    const selection = editor.getSelection();

    // copied from the snow toolbar code
    // to manually add the handler that would have been callen on the toolbar button
    if (selection == null || selection.length === 0) return;
    const preview = editor.getText(selection as any);
    const tooltip = (editor as any).theme.tooltip;
    tooltip.edit('link', preview);
    setIsButtonsMenuVisible(false);
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
          limitedTextFormatting={limitedTextFormatting}
          withCTAButton={withCTAButton}
          isButtonsMenuVisible={isButtonsMenuVisible}
          noImages={noImages}
          noVideos={noVideos}
          noAlign={noAlign}
          setIsButtonsMenuVisible={setIsButtonsMenuVisible}
          handleCustomLink={handleCustomLink}
          handleNormalLink={handleNormalLink}
          id={toolbarId}
        />
      )}
      <div>
        <div ref={containerRef} />
      </div>
    </StyleContainer>
  );
};

export default QuillEditor;
