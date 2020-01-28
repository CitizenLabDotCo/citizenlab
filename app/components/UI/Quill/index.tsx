import React, { memo, useEffect, useRef, useState } from 'react';

// quill
import Quill, { Sources, QuillOptionsStatic, RangeStatic } from 'quill';
import BlotFormatter from 'quill-blot-formatter';
import 'react-quill/dist/quill.snow.css';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from 'components/UI/QuillEditor/messages';

// styling
import styled from 'styled-components';
import { colors, quillEditedContent, media } from 'utils/styleUtils';

const Container = styled.div<{
  heading1: string,
  heading2: string,
  normal: string,
  videoPrompt: string,
  linkPrompt: string,
  visitPrompt: string,
  save: string,
  edit: string,
  remove: string
}>`
  .ql-picker.ql-header {
    .ql-picker-label::before {
      content: '${props => props.normal}' !important;
    }
    .ql-picker-label[data-value='1']::before {
      content: '${props => props.heading1}' !important;
    }
    .ql-picker-label[data-value='2']::before {
      content: '${props => props.heading2}' !important;
    }
    .ql-picker-item::before {
      content: '${props => props.normal}' !important;
    }
    .ql-picker-item[data-value='1']::before {
      content: '${props => props.heading1}' !important;
    }
    .ql-picker-item[data-value='2']::before {
      content: '${props => props.heading2}' !important;
    }
  }

  .ql-tooltip[data-mode=link]::before {
    content: '${props => props.linkPrompt}' !important;
  }

  .ql-tooltip[data-mode=video]::before {
    content: '${props => props.videoPrompt}' !important;
  }

  .ql-tooltip::before {
    content: '${props => props.visitPrompt}' !important;
  }

  .ql-tooltip.ql-editing a.ql-action::after {
    content: '${props => props.save}' !important;
  }

  .ql-tooltip a.ql-action::after {
    content: '${props => props.edit}' !important;
  }

  .ql-tooltip a.ql-remove::before {
    content: '${props => props.remove}' !important;
  }

  .ql-toolbar.ql-snow {
    background: #f8f8f8;
    border-radius: ${({ theme }) => theme.borderRadius} ${({ theme }) => theme.borderRadius} 0 0;
    box-shadow: none;
    border: 1px solid ${colors.separationDark};
    border-bottom: 0;
  }

  &.focussed {
    &:not(.error) .ql-toolbar.ql-snow + .ql-container.ql-snow {
      border-color: #000;
    }

    &.error .ql-toolbar.ql-snow + .ql-container.ql-snow {
      border-color: ${colors.clRedError};
    }
  }

  .ql-toolbar.ql-snow + .ql-container.ql-snow {
    width: 100%;
    height: 100%;
    max-height: ${({ theme: { menuHeight } }) => `calc(80vh - ${menuHeight}px)`};
    cursor: text;
    border-radius: 0 0 ${({ theme }) => theme.borderRadius} ${({ theme }) => theme.borderRadius};
    border: 1px solid ${colors.separationDark};
    box-shadow: inset 0 0 2px rgba(0, 0, 0, 0.1);
    ${quillEditedContent()};

    .ql-editor {
      min-height: 300px;
    }

    ${media.smallerThanMaxTablet`
      max-height: ${({ theme: { mobileMenuHeight } }) => `calc(80vh - ${mobileMenuHeight}px)`};
    `}
  }
`;

interface Props {
  id: string;
  noImages?: boolean;
  noVideos?: boolean;
  noAlign?: boolean;
  limitedTextFormatting?: boolean;
  noToolbar?: boolean;
  inAdmin?: boolean;
  hasError?: boolean;
  labelId?: string;
  className?: string;
  onChange?: (html: string) => void;
}

Quill.register('modules/blotFormatter', BlotFormatter);

const defaultOptions: QuillOptionsStatic = {
  theme: 'snow',
  modules: {
    toolbar: [
      [{ header: [1, 2, false] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ align: '' }, { align: 'center' }, { align: 'right' }],
      ['bold', 'italic'],
      ['link', 'image', 'video']
    ],
    blotFormatter: {}
  },
};

const useQuill = (options: QuillOptionsStatic) => {
  const [editor, setEditor] = useState<Quill | null>(null);
  const [content, setContent] = useState('');
  const [focussed, setFocussed] = useState(false);
  const editorRef: React.RefObject<any> = useRef();

  useEffect(() => {
    if (editor) {
      if (options?.readOnly) {
        editor.disable();
      } else {
        editor.enable();
      }
    }
  }, [editor, options]);

  useEffect(() => {
    const textChangeHandler = () => {
      if (editor) {
        // const delta = editor.getContents();
        // const text = editor.getText();
        const html = editor.root.innerHTML;
        setContent(html);
      }
    };

    const selectionChangeHandler = (range: RangeStatic, oldRange: RangeStatic, _source: Sources) => {
      if (editor) {
        if (range === null && oldRange !== null) {
          setFocussed(false);
        } else if (range !== null && oldRange === null) {
          setFocussed(true);
        }
      }
    };

    if (editor) {
      editor.on('text-change', textChangeHandler);
      editor.on('selection-change', selectionChangeHandler);
    }

    return () => {
      if (editor) {
        editor.off('text-change', textChangeHandler);
        editor.off('selection-change', selectionChangeHandler);
        setEditor(null);
      }
    };
  }, [editor]);

  useEffect(() => {
    if (!editor && editorRef && editorRef.current) {
      const editorOptions = { ...defaultOptions, ...options };
      setEditor(new Quill(editorRef.current, editorOptions));
    }
  }, [editor, editorRef, options]);

  return {
    editorRef,
    editor,
    content,
    focussed
  };
};

const QuillEditor2 = memo<Props & InjectedIntlProps>(({
  id,
  hasError,
  onChange,
  intl: { formatMessage },
  className,
  children
}) => {
  const { editorRef, content, focussed } = useQuill({});

  useEffect(() => {
    onChange && onChange(content);
  }, [content, onChange]);

  const classNames = [
    className,
    focussed ? 'focussed' : null,
    hasError ? 'error' : null
  ].filter(className => className).join(' ');

  return (
    <Container
      className={classNames}
      heading1={formatMessage(messages.title)}
      heading2={formatMessage(messages.subtitle)}
      normal={formatMessage(messages.normalText)}
      videoPrompt={formatMessage(messages.videoPrompt)}
      linkPrompt={formatMessage(messages.linkPrompt)}
      visitPrompt={formatMessage(messages.visitPrompt)}
      save={formatMessage(messages.save)}
      edit={formatMessage(messages.edit)}
      remove={formatMessage(messages.remove)}
    >
      <div id={id} ref={editorRef}>
        {children}
      </div>
    </Container>
  );
});

export default injectIntl(QuillEditor2);
