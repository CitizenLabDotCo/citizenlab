import { useRef, useEffect, useState, useLayoutEffect } from 'react';

import { debounce } from 'lodash-es';
import Quill from 'quill';

import { useIntl } from 'utils/cl-intl';

import { configureQuill, setEmbeddedVideoTitle } from './configureQuill';
import { createQuill, detachQuillFromToolbar } from './createQuill';
import messages from './messages';
import { getHTML, setHTML } from './utils';

export interface QuillEditorParams {
  id: string;
  // The id of the element Quill uses as its toolbar container.
  toolbarId: string;
  value?: string;
  noImages: boolean;
  noVideos: boolean;
  noAlign: boolean;
  noLinks: boolean;
  withGifSupport?: boolean;
  limitedTextFormatting?: boolean;
  withCTAButton?: boolean;
  onChange?: (html: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
  ariaInvalid?: boolean;
  ariaLabel?: string;
  placeholder?: string;
}

configureQuill();

// The Quill engine behind every rich text editor: creates the editor in
// containerRef, reports changes as sanitised HTML and keeps it in sync with value.
const useQuillEditor = ({
  id,
  toolbarId,
  value,
  noImages,
  noVideos,
  noAlign,
  noLinks,
  withGifSupport,
  limitedTextFormatting,
  withCTAButton,
  onChange,
  onFocus,
  onBlur,
  ariaLabelledBy,
  ariaDescribedBy,
  ariaInvalid,
  ariaLabel,
  placeholder,
}: QuillEditorParams) => {
  const { formatMessage } = useIntl();
  const [editor, setEditor] = useState<Quill | null>(null);
  const [focussed, setFocussed] = useState(false);
  const [imageTooLargeModalOpened, setImageTooLargeModalOpened] =
    useState(false);

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
      onImageTooLarge: () => setImageTooLargeModalOpened(true),
      altTextLabel: formatMessage(messages.altTextLabel),
      imageTitleLabel: formatMessage(messages.imageTitleLabel),
      ariaLabelledBy,
      ariaLabel,
      placeholder,
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
      detachQuillFromToolbar(quill);
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

  // Update aria attributes dynamically when they change
  useEffect(() => {
    if (!editor) return;

    const editorElement = editor.root;

    if (ariaInvalid) {
      editorElement.setAttribute('aria-invalid', String(ariaInvalid));
    } else {
      editorElement.removeAttribute('aria-invalid');
    }

    if (ariaDescribedBy) {
      editorElement.setAttribute('aria-describedby', ariaDescribedBy);
    } else {
      editorElement.removeAttribute('aria-describedby');
    }
  }, [editor, ariaInvalid, ariaDescribedBy]);

  return {
    editor,
    containerRef,
    focussed,
    saveLatestContent,
    imageTooLargeModalOpened,
    closeImageTooLargeModal: () => setImageTooLargeModalOpened(false),
  };
};

export default useQuillEditor;
