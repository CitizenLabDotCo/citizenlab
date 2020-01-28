import React, { memo, useEffect, useRef, useState } from 'react';

// quill
import Quill, { Sources, QuillOptionsStatic, RangeStatic, DeltaOperation } from 'quill';
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

  .ql-toolbar {
    background: #f8f8f8;
    border-radius: ${({ theme }) => theme.borderRadius} ${({ theme }) => theme.borderRadius} 0 0;
    box-shadow: none !important;
    border: 1px solid ${colors.separationDark} !important;
    border-bottom: 0 !important;
  }

  .ql-container {
    width: 100%;
    height: 100%;
    max-height: ${({ theme: { menuHeight } }) => `calc(80vh - ${menuHeight}px)`};
    cursor: text;
    border-radius: 0 0 ${({ theme }) => theme.borderRadius} ${({ theme }) => theme.borderRadius};
    border: 1px solid ${colors.separationDark } !important;
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

interface QuillDelta {
  ops: DeltaOperation;
}

interface Props {
  options?: QuillOptionsStatic;
  contents?: string | QuillDelta;
  tabIndex?: number;
  onChange?: (html: string, contents: QuillDelta, delta: QuillDelta, source: Sources) => void;
  onChangeSelection?: (selection: RangeStatic | undefined, source: Sources) => void;
  onFocus?: (selection: RangeStatic | undefined, source: Sources) => void;
  onBlur?: (selection: RangeStatic | undefined, source: Sources) => void;
  onKeyPress?: () => void;
  onKeyDown?: () => void;
  onKeyUp?: () => void;
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

const useQuill = ({ options }: Props) => {
  const [editor, setEditor] = useState<Quill | null>(null);
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
        const delta = editor.getContents();
        const text = editor.getText();
        const html = editor.root.innerHTML;
        console.log('delta:');
        console.log(delta);
        console.log('text:');
        console.log(text);
        console.log('html:');
        console.log(html);
      }
    };

    if (editor) {
      editor.on('text-change', textChangeHandler);
    }

    return () => {
      if (editor) {
        editor.off('text-change', textChangeHandler);
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
  };
};

const QuillEditor2 = memo<Props & InjectedIntlProps>((props) => {
  const { intl, ...quillProps } = props;
  const { formatMessage } = intl;
  const { editorRef } = useQuill(quillProps);

  return (
    <Container
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
      <div ref={editorRef}>{props.children}</div>
    </Container>
  );
});

export default injectIntl(QuillEditor2);
