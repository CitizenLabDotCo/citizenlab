import React, { useRef, useEffect, useState } from 'react';

import Quill from 'quill';
import 'quill/dist/quill.snow.css';

// import { configureQuill } from './configureQuill';

export interface Props {
  id: string;
  value?: string;
  label?: string | JSX.Element | null;
  labelTooltipText?: string | JSX.Element | null;
  placeholder?: string;
  noToolbar?: boolean;
  noImages?: boolean;
  noVideos?: boolean;
  noAlign?: boolean;
  limitedTextFormatting?: boolean;
  hasError?: boolean;
  className?: string;
  maxHeight?: string;
  minHeight?: string;
  onChange?: (html: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  setRef?: (arg: HTMLDivElement) => void | undefined;
  withCTAButton?: boolean;
}

// configureQuill();

const QuillEditor = ({ value, onChange }: Props) => {
  const [editor, setEditor] = useState<Quill | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize Quill
  // https://quilljs.com/playground/react
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const editorContainer = container.appendChild(
      container.ownerDocument.createElement('div')
    );

    const quill = new Quill(editorContainer, {
      theme: 'snow',
    });

    if (value) {
      const delta = quill.clipboard.convert({ html: value });
      quill.setContents(delta);
    }

    setEditor(quill);

    return () => {
      container.innerHTML = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle text changes
  useEffect(() => {
    if (!editor) return;

    const handler = () => {
      const html =
        editor.root.innerHTML === '<p><br></p>' ? '' : editor.root.innerHTML;

      onChange?.(html);
    };

    editor.on('text-change', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  return <div ref={containerRef} />;
};

export default QuillEditor;
