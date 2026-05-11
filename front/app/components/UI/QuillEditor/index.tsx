import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useLayoutEffect,
} from 'react';

import { Label, IconTooltip, Box } from '@citizenlab/cl2-component-library';
import { debounce } from 'lodash-es';
import Quill from 'quill';

import { useIntl } from 'utils/cl-intl';

import 'quill/dist/quill.snow.css';
import '@enzedonline/quill-blot-formatter2/dist/css/quill-blot-formatter2.css';

import { configureQuill, setEmbeddedVideoTitle } from './configureQuill';
import { createQuill } from './createQuill';
import messages from './messages';
import StyleContainer from './StyleContainer';
import Toolbar from './Toolbar';
import { getHTML, setHTML, getQuillPlainTextLength } from './utils';

export interface Props {
  id: string;
  value?: string;
  label?: string | JSX.Element | null;
  labelTooltipText?: string | JSX.Element | null;
  noImages?: boolean;
  noVideos?: boolean;
  noAlign?: boolean;
  noLinks?: boolean;
  withGifSupport?: boolean;
  limitedTextFormatting?: boolean;
  maxHeight?: string;
  minHeight?: string;
  withCTAButton?: boolean;
  onChange?: (html: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  maxCharCount?: number;
  minCharCount?: number;
  ariaLabelledBy?: string;
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
  withGifSupport,
  limitedTextFormatting,
  maxHeight,
  minHeight,
  withCTAButton,
  onChange,
  onBlur,
  onFocus,
  maxCharCount,
  minCharCount,
  ariaLabelledBy,
}: Props) => {
  const { formatMessage } = useIntl();
  const [editor, setEditor] = useState<Quill | null>(null);
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
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const editorContainer = container.appendChild(
      container.ownerDocument.createElement('div')
    );

    setEmbeddedVideoTitle(formatMessage(messages.embeddedVideo));

    const quill = createQuill(editorContainer, {
      id,
      toolbarId,
      noImages,
      noVideos,
      noAlign,
      noLinks,
      withGifSupport,
      limitedTextFormatting,
      withCTAButton,
      onBlur: onBlurRef.current,
      altTextLabel: formatMessage(messages.altTextLabel),
      imageTitleLabel: formatMessage(messages.imageTitleLabel),
      ariaLabelledBy,
    });

    setHTML(quill, value);
    setEditor(quill);

    // When the blot-formatter alt text modal is appended to document.body,
    // it falls outside react-focus-on's focus trap (used by our Modal component).
    // Adding data-no-focus-lock lets react-focus-lock allow interaction with it.
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (
            node instanceof HTMLElement &&
            node.hasAttribute('data-blot-formatter-modal')
          ) {
            node.setAttribute('data-no-focus-lock', 'true');
          }
        }
      }
    });
    observer.observe(document.body, { childList: true });

    return () => {
      observer.disconnect();
      container.innerHTML = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle text and focus changes
  useEffect(() => {
    if (!editor) return;

    // Convert Delta back to HTML
    const textChangeHandler = () => {
      const html = getHTML(editor);

      if (html === htmlRef.current) return;

      htmlRef.current = html;
      onChangeRef.current?.(html);
    };

    const debouncedTextChangeHandler = debounce(textChangeHandler, 100);

    // Native focus/blur handlers for cross-browser compatibility
    const handleFocus = () => {
      setFocussed(true);
      onFocusRef.current?.();
    };

    const handleBlur = () => {
      setFocussed(false);
      onBlurRef.current?.();
    };

    const editorElement = editor.root;

    editor.on('text-change', debouncedTextChangeHandler);
    editorElement.addEventListener('focus', handleFocus);
    editorElement.addEventListener('blur', handleBlur);

    return () => {
      editor.off('text-change', debouncedTextChangeHandler);
      editorElement.removeEventListener('focus', handleFocus);
      editorElement.removeEventListener('blur', handleBlur);
    };
  }, [editor]);

  // Synchronize the editor content with the value prop
  useEffect(() => {
    if (!editor) return;

    if (value !== htmlRef.current) {
      setHTML(editor, value);
      const html = getHTML(editor);
      htmlRef.current = html;
    }
  }, [value, editor]);

  // Function to save the latest state of the content.
  // We call this when the mouse leaves the editor, to ensure the
  // latest content (and image size + alt text) is properly saved.
  const saveLatestContent = () => {
    if (!editor) return;
    const html = getHTML(editor);

    if (html === htmlRef.current) return;

    htmlRef.current = html;
    onChangeRef.current?.(html);
  };

  const handleLabelOnClick = useCallback(() => {
    editor?.focus();
  }, [editor]);

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
        editor={editor}
        setIsButtonsMenuVisible={setIsButtonsMenuVisible}
      />
      <div>
        <div ref={containerRef} />
      </div>
      {(maxCharCount || minCharCount) && editor && (
        <Box
          display="flex"
          justifyContent="flex-end"
          mt="8px"
          color={
            (maxCharCount && getQuillPlainTextLength(editor) > maxCharCount) ||
            (minCharCount && getQuillPlainTextLength(editor) < minCharCount)
              ? 'red600'
              : 'textSecondary'
          }
        >
          {getQuillPlainTextLength(editor)}
          {maxCharCount && ` / ${maxCharCount}`}
          {minCharCount && ` (≥ ${minCharCount})`}
        </Box>
      )}
    </StyleContainer>
  );
};

export default QuillEditor;
