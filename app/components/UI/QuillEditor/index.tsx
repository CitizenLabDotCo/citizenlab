import React, { memo, useEffect, useRef, useState } from 'react';

// quill
import Quill, { Sources, QuillOptionsStatic, RangeStatic } from 'quill';
import BlotFormatter from 'quill-blot-formatter';
import { QuillDeltaToHtmlConverter } from 'quill-delta-to-html';
import 'quill/dist/quill.snow.css';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

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
    overflow-y: auto;
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
  value?: string;
  placeholder?: string;
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
  setRef?: (arg: HTMLDivElement) => void | undefined;
}

Quill.register('modules/blotFormatter', BlotFormatter);

const QuillEditor = memo<Props & InjectedIntlProps>(({
  id,
  value,
  placeholder,
  noToolbar,
  noAlign,
  noImages,
  noVideos,
  limitedTextFormatting,
  hasError,
  className,
  setRef,
  onChange,
  intl: {
    formatMessage
  },
  children
}) => {
  const toolbarId = !noToolbar && id ? `ql-editor-toolbar-${id}` : null;

  const [editor, setEditor] = useState<Quill | null>(null);
  const contentRef = useRef<string>();
  const [focussed, setFocussed] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!editor && editorRef && editorRef.current) {
      const editorOptions: QuillOptionsStatic = {
        formats: [
          'bold',
          'italic',
          'link',
          ...(!limitedTextFormatting ? ['header', 'list'] : []),
          ...(!limitedTextFormatting && !noAlign ? ['align'] : []),
          ...(!noImages ? ['image'] : []),
          ...(!noVideos ? ['video'] : [])
        ],
        theme: 'snow',
        placeholder: placeholder || '',
        modules: {
          blotFormatter: (noImages && noVideos) ? false : true,
          toolbar: toolbarId ? `#${toolbarId}` : false,
          keyboard: {
            bindings: {
              // overwrite default tab behavior
              tab: {
                key: 9,
                handler: () => true // do nothing
              },
              'remove tab': {
                key: 9,
                shiftKey: true,
                collapsed: true,
                prefix: /\t$/,
                handler: () => true // do nothing
              }
            }
          },
          clipboard: {
            matchVisual: true
          },
        },
      };

      setEditor(new Quill(editorRef.current, editorOptions));
    }
  }, [placeholder, noAlign, noImages, noVideos, limitedTextFormatting, toolbarId, editor, editorRef]);

  useEffect(() => {
    const textChangeHandler = () => {
      if (editor) {
        const delta = editor.getContents();
        const converter = new QuillDeltaToHtmlConverter(delta.ops || [], {});
        const html = converter.convert();
        contentRef.current = html;
        onChange && onChange(html);
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
  }, [editor, onChange]);

  useEffect(() => {
    if (editor?.root && setRef) {
      setRef(editor.root);
    }
  }, [editor]);

  useEffect(() => {
    if (editor && value !== contentRef.current) {
      editor.clipboard.dangerouslyPasteHTML(value || '');
      contentRef.current = value;
    }
  }, [editor, value]);

  const trackAdvanced = (type, option) => (_event: React.MouseEvent<HTMLElement>) => {
    trackEventByName(tracks.advancedEditing.name, {
      extra: {
        type,
        option,
      },
    });
  };

  const trackClickDropdown = (event: React.MouseEvent<HTMLElement>) => {
    if (event.currentTarget && event.currentTarget.classList.contains('ql-picker-item')) {
      const value = event.currentTarget.getAttribute('data-value');
      let option;

      if (value === '1') {
        option = 'title';
      } else if (value === '2') {
        option = 'subtitle';
      } else {
        option = 'normal';
      }

      trackEventByName(tracks.advancedEditing.name, {
        extra: {
          option,
          type: 'heading',
        },
      });
    }
  };

  const trackBasic = (type) => (_event: React.MouseEvent<HTMLElement>) => {
    trackEventByName(tracks.basicEditing.name, {
      extra: {
        type,
      },
    });
  };

  const trackImage = (_event: React.MouseEvent<HTMLElement>) => {
    trackEventByName(tracks.imageEditing.name);
  };

  const trackVideo = (_event: React.MouseEvent<HTMLElement>) => {
    trackEventByName(tracks.videoEditing.name);
  };

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
      {!noToolbar &&
        <div id={toolbarId || undefined} >
          {!limitedTextFormatting &&
            <span
              className="ql-formats"
              role="button"
              onClick={trackClickDropdown}
            >
              <select className="ql-header" defaultValue={''}>
                <option
                  value="2"
                  aria-selected={false}
                >{formatMessage(messages.title)}
                </option>
                <option
                  value="3"
                  aria-selected={false}
                >{formatMessage(messages.subtitle)}
                </option>
                <option
                  value=""
                  aria-selected
                >{formatMessage(messages.normalText)}
                </option>
              </select>
            </span>
          }

          {!limitedTextFormatting && !noAlign &&
            <span className="ql-formats">
              <button
                className="ql-align"
                value=""
                onClick={trackAdvanced('align', 'left')}
                aria-label={formatMessage(messages.alignLeft)}
              />
              <button
                className="ql-align"
                value="center"
                onClick={trackAdvanced('align', 'center')}
                aria-label={formatMessage(messages.alignCenter)}
              />
              <button
                className="ql-align"
                value="right"
                onClick={trackAdvanced('align', 'right')}
                aria-label={formatMessage(messages.alignRight)}
              />
            </span>
          }

          {!limitedTextFormatting &&
            <span className="ql-formats">
              <button
                className="ql-list"
                value="ordered"
                onClick={trackAdvanced('list', 'ordered')}
                aria-label={formatMessage(messages.orderedList)}
              />
              <button
                className="ql-list"
                value="bullet"
                onClick={trackAdvanced('list', 'bullet')}
                aria-label={formatMessage(messages.unorderedList)}
              />
            </span>
          }

          <span className="ql-formats">
            <button className="ql-bold" onClick={trackBasic('bold')} aria-label={formatMessage(messages.bold)} />
            <button className="ql-italic" onClick={trackBasic('italic')} aria-label={formatMessage(messages.italic)} />
            <button className="ql-link" onClick={trackBasic('link')} aria-label={formatMessage(messages.link)} />
          </span>

          {!(noImages && noVideos) &&
            <span className="ql-formats">
              {!noImages && <button className="ql-image" onClick={trackImage} aria-label={formatMessage(messages.image)} />}
              {!noVideos && <button className="ql-video" onClick={trackVideo} aria-label={formatMessage(messages.video)} />}
            </span>
          }
        </div>
      }
      <div id={id} ref={editorRef}>
        {children}
      </div>
    </Container>
  );
});

export default injectIntl(QuillEditor);
