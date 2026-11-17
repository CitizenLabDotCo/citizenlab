import React, { RefCallback, useEffect, useRef } from 'react';

import 'quill/dist/quill.snow.css';
import '@enzedonline/quill-blot-formatter2/dist/css/quill-blot-formatter2.css';

import RichTextEditor from 'design-system/RichTextEditor';

import useLocale from 'hooks/useLocale';

import quillMessages from 'components/UI/QuillEditor/messages';
import useQuillEditor from 'components/UI/QuillEditor/useQuillEditor';

import 'design-system/tokens.css';

import { useIntl } from 'utils/cl-intl';

import FormattingToolbar from './FormattingToolbar';
import ImageTooLargeModal from './ImageTooLargeModal';
import styles from './RichTextField.module.css';

interface Props {
  id: string;
  value?: string;
  onChange: (html: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  // Gets the editing element, e.g. for a form library that focuses the first invalid field.
  editorRef?: RefCallback<HTMLElement>;
  'aria-label': string;
  'aria-describedby'?: string;
  isInvalid?: boolean;
  placeholder?: string;
  noImages?: boolean;
  noVideos?: boolean;
  noLinks?: boolean;
  noAlign?: boolean;
  limitedTextFormatting?: boolean;
  // Adds the "Add button" tool, which turns the selected text into a button link.
  withCTAButton?: boolean;
}

// The Quill editor in the design-system frame, with the design-system toolbar.
const RichTextField = ({
  id,
  value,
  onChange,
  onFocus,
  onBlur,
  editorRef,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  isInvalid,
  placeholder,
  noImages = false,
  noVideos = false,
  noLinks = false,
  noAlign = false,
  limitedTextFormatting = false,
  withCTAButton = false,
}: Props) => {
  const { formatMessage } = useIntl();
  // Like the old editor: the text runs right to left when the platform is shown in Arabic.
  const isRtl = useLocale().startsWith('ar');
  const fieldRef = useRef<HTMLDivElement>(null);
  const toolbarId = `ql-editor-toolbar-${id}`;

  const {
    editor,
    containerRef,
    saveLatestContent,
    imageTooLargeModalOpened,
    closeImageTooLargeModal,
  } = useQuillEditor({
    id,
    toolbarId,
    value,
    noImages,
    noVideos,
    noAlign,
    noLinks,
    limitedTextFormatting,
    withCTAButton,
    onChange,
    onFocus,
    onBlur,
    ariaDescribedBy,
    ariaInvalid: isInvalid,
    ariaLabel,
    placeholder,
  });

  useEffect(() => {
    if (!editor || !editorRef) return;
    editorRef(editor.root);
    return () => editorRef(null);
  }, [editor, editorRef]);

  // Quill's link and video tooltip takes its words from CSS content, so the
  // translations go in as custom properties.
  useEffect(() => {
    const field = fieldRef.current;
    if (!field) return;

    const prompts = {
      '--rich-text-link-prompt': quillMessages.linkPrompt,
      '--rich-text-video-prompt': quillMessages.videoPrompt,
      '--rich-text-visit-prompt': quillMessages.visitPrompt,
      '--rich-text-save': quillMessages.save,
      '--rich-text-edit': quillMessages.edit,
      '--rich-text-remove': quillMessages.remove,
    };
    Object.entries(prompts).forEach(([property, message]) => {
      const text = JSON.stringify(formatMessage(message));
      field.style.setProperty(property, text);
    });
  }, [formatMessage]);

  return (
    <div
      ref={fieldRef}
      className={styles.field}
      data-invalid={isInvalid || undefined}
      data-rtl={isRtl || undefined}
      // Saving on mouse leave is not an interaction of its own.
      role="presentation"
      onMouseLeave={saveLatestContent}
    >
      {/* Quill's own toolbar, never shown: it holds Quill's handlers. Quill
          binds Ctrl/Cmd+K to the link tool only when it finds a link button here. */}
      <div id={toolbarId} hidden>
        {!noLinks && (
          <button
            type="button"
            className="ql-link"
            tabIndex={-1}
            aria-label={formatMessage(quillMessages.link)}
          />
        )}
      </div>
      <RichTextEditor
        toolbar={
          <FormattingToolbar
            editor={editor}
            noImages={noImages}
            noVideos={noVideos}
            noLinks={noLinks}
            noAlign={noAlign}
            limitedTextFormatting={limitedTextFormatting}
            withCTAButton={withCTAButton}
          />
        }
      >
        <div ref={containerRef} />
      </RichTextEditor>
      <ImageTooLargeModal
        isOpen={imageTooLargeModalOpened}
        onClose={closeImageTooLargeModal}
      />
    </div>
  );
};

export default RichTextField;
