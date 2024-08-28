import React, { useRef, useEffect, useState } from 'react';

import Quill from 'quill';

import 'quill/dist/quill.snow.css';
import { attributes } from './altTextToImagesModule';
import { configureQuill } from './configureQuill';
import Toolbar from './Toolbar';

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

configureQuill();

const QuillEditor = ({
  id,
  value,
  placeholder,
  withCTAButton,
  limitedTextFormatting,
  noAlign,
  noImages,
  noVideos,
  noToolbar,
  onChange,
  onBlur,
}: Props) => {
  const [editor, setEditor] = useState<Quill | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const toolbarId = !noToolbar ? `ql-editor-toolbar-${id}` : undefined;

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
      formats: [
        'bold',
        'italic',
        'link',
        ...attributes,
        ...(withCTAButton ? ['button'] : []),
        ...(!limitedTextFormatting ? ['header', 'list'] : []),
        ...(!limitedTextFormatting && !noAlign ? ['align'] : []),
        ...(!noImages ? ['image'] : []),
        ...(!noVideos ? ['video'] : []),
      ],
      placeholder: placeholder || '',
      modules: {
        altTextToImages: true,
        blotFormatter: !noImages || !noVideos ? true : false,
        toolbar: toolbarId ? `#${toolbarId}` : false,
        keyboard: {
          bindings: {
            // overwrite default tab behavior
            tab: {
              key: 9,
              handler: () => {
                onBlur && onBlur();
                return true;
              }, // do nothing
            },
            'remove tab': {
              key: 9,
              shiftKey: true,
              collapsed: true,
              prefix: /\t$/,
              handler: () => true, // do nothing
            },
          },
        },
        clipboard: {
          matchVisual: false,
        },
      },
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

  return (
    <div>
      {toolbarId && (
        <Toolbar
          limitedTextFormatting={limitedTextFormatting}
          withCTAButton={withCTAButton}
          isButtonsMenuVisible={false} // TODO
          noImages={noImages}
          noVideos={noVideos}
          noAlign={noAlign}
          // setIsButtonsMenuVisible={setIsButtonsMenuVisible}
          setIsButtonsMenuVisible={() => {}} // TODO
          // handleCustomLink={handleCustomLink}
          handleCustomLink={() => {}} // TODO
          // handleNormalLink={handleNormalLink}
          handleNormalLink={() => {}} // TODO
          id={toolbarId}
        />
      )}
      <div ref={containerRef} />
    </div>
  );
};

export default QuillEditor;
