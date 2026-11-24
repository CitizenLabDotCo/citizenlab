import React, { useState, useCallback } from 'react';

import { Label, IconTooltip, Box } from '@citizenlab/cl2-component-library';

import 'quill/dist/quill.snow.css';
import '@enzedonline/quill-blot-formatter2/dist/css/quill-blot-formatter2.css';

import ImageTooLargeModal from './ImageTooLargeModal';
import StyleContainer from './StyleContainer';
import Toolbar from './Toolbar';
import useQuillEditor from './useQuillEditor';
import { getQuillPlainTextLength } from './utils';

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
  ariaDescribedBy?: string;
  ariaInvalid?: boolean;
  ariaLabel?: string;
  placeholder?: string;
}

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
  ariaDescribedBy,
  ariaInvalid,
  ariaLabel,
  placeholder,
}: Props) => {
  const [isButtonsMenuVisible, setIsButtonsMenuVisible] = useState(false);
  const toolbarId = `ql-editor-toolbar-${id}`;

  const {
    editor,
    containerRef,
    focussed,
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
  });

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
      <ImageTooLargeModal
        opened={imageTooLargeModalOpened}
        close={closeImageTooLargeModal}
      />
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
