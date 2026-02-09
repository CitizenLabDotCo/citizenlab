import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useLayoutEffect,
} from 'react';

import { Label, IconTooltip, Box } from '@citizenlab/cl2-component-library';
import { debounce } from 'lodash-es';
import Quill, { RangeStatic } from 'quill';

import 'quill/dist/quill.snow.css';

import { useIntl } from 'utils/cl-intl';

import { configureQuill } from './configureQuill';
import { createQuill } from './createQuill';
import messages from './messages';
import StyleContainer from './StyleContainer';
import Toolbar from './Toolbar';
import {
  getHTML,
  setHTML,
  syncPlaceHolder,
  getQuillPlainTextLength,
} from './utils';

export interface Props {
  id: string;
  value?: string;
  label?: string | JSX.Element | null;
  labelTooltipText?: string | JSX.Element | null;
  noImages?: boolean;
  noVideos?: boolean;
  noAlign?: boolean;
  noLinks?: boolean;
  limitedTextFormatting?: boolean;
  maxHeight?: string;
  minHeight?: string;
  withCTAButton?: boolean;
  onChange?: (html: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  maxCharCount?: number;
  minCharCount?: number;
}

configureQuill();

const QuillEditor = ({
  id,
  value,
  label,
  labelTooltipText,
  noAlign = false,
  noImages = false,
  noVideos = false,
  noLinks = false,
  limitedTextFormatting,
  maxHeight,
  minHeight,
  withCTAButton,
  onChange,
  onBlur,
  onFocus,
  maxCharCount,
  minCharCount,
}: Props) => {
  const { formatMessage } = useIntl();
  const [focussed, setFocussed] = useState(false);

  const [isButtonsMenuVisible, setIsButtonsMenuVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const htmlRef = useRef<string | null>(null);

  const onChangeRef = useRef(onChange);
  const onBlurRef = useRef(onBlur);
  const onFocusRef = useRef(onFocus);

  useLayoutEffect(() => {
    onChangeRef.current = onChange;
    onBlurRef.current = onBlur;
    onFocusRef.current = onFocus;
  });

  const toolbarId = `ql-editor-toolbar-${id}`;

  // Initialize Quill
  // https://quilljs.com/playground/react
  // Using ref to persist across StrictMode remounts
  const editorRef = useRef<Quill | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Reuse existing Quill instance (fixes React StrictMode double-mount)
    if (editorRef.current) return;

    const editorContainer = container.appendChild(
      container.ownerDocument.createElement('div')
    );

    const quill = createQuill(editorContainer, {
      id,
      toolbarId,
      noImages,
      noVideos,
      noAlign,
      noLinks,
      limitedTextFormatting,
      withCTAButton,
      onBlur: onBlurRef.current,
    });

    editorRef.current = quill;
    setHTML(quill, value);

    return () => {
      // Only cleanup in production - in dev, StrictMode double-mounts break Quill
      if (process.env.NODE_ENV !== 'development') {
        container.innerHTML = '';
      }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle text and focus changes
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    // Convert Delta back to HTML
    const textChangeHandler = () => {
      const html = getHTML(editor);

      if (html === htmlRef.current) return;

      htmlRef.current = html;
      onChangeRef.current?.(html);
    };

    const debouncedTextChangeHandler = debounce(textChangeHandler, 100);

    // Not sure why we handle focus like this, but seems to work
    const focusHandler = (range: RangeStatic, oldRange: RangeStatic) => {
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (range === null && oldRange !== null) {
        setFocussed(false);
        onBlurRef.current?.();
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      } else if (range !== null && oldRange === null) {
        setFocussed(true);
        onFocusRef.current?.();
      }
    };

    editor.on('text-change', debouncedTextChangeHandler);
    editor.on('selection-change', focusHandler);

    return () => {
      editor.off('text-change', debouncedTextChangeHandler);
      editor.off('selection-change', focusHandler);
    };
  }, []);

  // Synchronize the editor content with the value prop
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    if (value !== htmlRef.current) {
      setHTML(editor, value);
      const html = getHTML(editor);
      htmlRef.current = html;
    }
  }, [value]);

  // Hack to get correct placeholder for image alt text input
  const altTextPlaceHolder = formatMessage(messages.altTextPlaceholder);
  useEffect(() => {
    syncPlaceHolder(altTextPlaceHolder);
  }, [altTextPlaceHolder]);

  // Function to save the latest state of the content.
  // We call this when the mouse leaves the editor, to ensure the
  // latest content (and image size + alt text) is properly saved.
  const saveLatestContent = () => {
    const editor = editorRef.current;
    if (!editor) return;
    const html = getHTML(editor);

    if (html === htmlRef.current) return;

    htmlRef.current = html;
    onChangeRef.current?.(html);
  };

  const handleLabelOnClick = useCallback(() => {
    editorRef.current?.focus();
  }, []);

  const className = focussed ? 'focus' : '';

  return (
    <StyleContainer
      maxHeight={maxHeight}
      minHeight={minHeight}
      className={className}
      onMouseLeave={saveLatestContent}
    >
      {label && (
        <Label htmlFor={id} onClick={handleLabelOnClick}>
          <span>{label}</span>
          {labelTooltipText && <IconTooltip content={labelTooltipText} />}
        </Label>
      )}
      <Toolbar
        id={toolbarId}
        limitedTextFormatting={limitedTextFormatting}
        withCTAButton={withCTAButton}
        isButtonsMenuVisible={isButtonsMenuVisible}
        noImages={noImages}
        noVideos={noVideos}
        noAlign={noAlign}
        noLinks={noLinks}
        editor={editorRef.current}
        setIsButtonsMenuVisible={setIsButtonsMenuVisible}
      />
      <div>
        <div ref={containerRef} />
      </div>
      {(maxCharCount || minCharCount) && editorRef.current && (
        <Box
          display="flex"
          justifyContent="flex-end"
          mt="8px"
          color={
            (maxCharCount &&
              getQuillPlainTextLength(editorRef.current) > maxCharCount) ||
            (minCharCount &&
              getQuillPlainTextLength(editorRef.current) < minCharCount)
              ? 'red600'
              : 'textSecondary'
          }
        >
          {getQuillPlainTextLength(editorRef.current)}
          {maxCharCount && ` / ${maxCharCount}`}
          {minCharCount && ` (≥ ${minCharCount})`}
        </Box>
      )}
    </StyleContainer>
  );
};

export default QuillEditor;
