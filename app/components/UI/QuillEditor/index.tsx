import React, { memo, useEffect, useRef, useState, useCallback } from 'react';
import usePrevious from 'hooks/usePrevious';
import { debounce } from 'lodash-es';

// quill
import Quill, { Sources, QuillOptionsStatic, RangeStatic } from 'quill';
import BlotFormatter from 'quill-blot-formatter';
import 'quill/dist/quill.snow.css';

// components
import Label from 'components/UI/Label';
import IconTooltip from 'components/UI/IconTooltip';

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

// typings
import { Locale } from 'typings';

const Container = styled.div<{
  videoPrompt: string,
  linkPrompt: string,
  visitPrompt: string,
  save: string,
  edit: string,
  remove: string
}>`
  .ql-snow.ql-toolbar button:hover .ql-stroke, .ql-snow .ql-toolbar button:hover .ql-stroke, .ql-snow.ql-toolbar button:focus .ql-stroke, .ql-snow .ql-toolbar button:focus .ql-stroke, .ql-snow.ql-toolbar button.ql-active .ql-stroke, .ql-snow .ql-toolbar button.ql-active .ql-stroke, .ql-snow.ql-toolbar .ql-picker-label:hover .ql-stroke, .ql-snow .ql-toolbar .ql-picker-label:hover .ql-stroke, .ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-stroke, .ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-stroke, .ql-snow.ql-toolbar .ql-picker-item:hover .ql-stroke, .ql-snow .ql-toolbar .ql-picker-item:hover .ql-stroke, .ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-stroke, .ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-stroke, .ql-snow.ql-toolbar button:hover .ql-stroke-miter, .ql-snow .ql-toolbar button:hover .ql-stroke-miter, .ql-snow.ql-toolbar button:focus .ql-stroke-miter, .ql-snow .ql-toolbar button:focus .ql-stroke-miter, .ql-snow.ql-toolbar button.ql-active .ql-stroke-miter, .ql-snow .ql-toolbar button.ql-active .ql-stroke-miter, .ql-snow.ql-toolbar .ql-picker-label:hover .ql-stroke-miter, .ql-snow .ql-toolbar .ql-picker-label:hover .ql-stroke-miter, .ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-stroke-miter, .ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-stroke-miter, .ql-snow.ql-toolbar .ql-picker-item:hover .ql-stroke-miter, .ql-snow .ql-toolbar .ql-picker-item:hover .ql-stroke-miter, .ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-stroke-miter, .ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-stroke-miter, .ql-picker-label:focus .ql-stroke, .ql-picker-item:focus .ql-stroke {
    stroke: ${colors.clBlue};
  }

  .ql-snow.ql-toolbar button:hover .ql-fill, .ql-snow .ql-toolbar button:hover .ql-fill, .ql-snow.ql-toolbar button:focus .ql-fill, .ql-snow .ql-toolbar button:focus .ql-fill, .ql-snow.ql-toolbar button.ql-active .ql-fill, .ql-snow .ql-toolbar button.ql-active .ql-fill, .ql-snow.ql-toolbar .ql-picker-label:hover .ql-fill, .ql-snow .ql-toolbar .ql-picker-label:hover .ql-fill, .ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-fill, .ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-fill, .ql-snow.ql-toolbar .ql-picker-item:hover .ql-fill, .ql-snow .ql-toolbar .ql-picker-item:hover .ql-fill, .ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-fill, .ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-fill, .ql-snow.ql-toolbar button:hover .ql-stroke.ql-fill, .ql-snow .ql-toolbar button:hover .ql-stroke.ql-fill, .ql-snow.ql-toolbar button:focus .ql-stroke.ql-fill, .ql-snow .ql-toolbar button:focus .ql-stroke.ql-fill, .ql-snow.ql-toolbar button.ql-active .ql-stroke.ql-fill, .ql-snow .ql-toolbar button.ql-active .ql-stroke.ql-fill, .ql-snow.ql-toolbar .ql-picker-label:hover .ql-stroke.ql-fill, .ql-snow .ql-toolbar .ql-picker-label:hover .ql-stroke.ql-fill, .ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-stroke.ql-fill, .ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-stroke.ql-fill, .ql-snow.ql-toolbar .ql-picker-item:hover .ql-stroke.ql-fill, .ql-snow .ql-toolbar .ql-picker-item:hover .ql-stroke.ql-fill, .ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-stroke.ql-fill, .ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-stroke.ql-fill, .ql-snow.ql-toolbar .ql-picker-label:focus .ql-stroke.ql-fill, .ql-snow.ql-toolbar .ql-picker-item:focus .ql-stroke.ql-fill {
    fill: ${colors.clBlue};
  }

  .ql-snow.ql-toolbar button:hover, .ql-snow .ql-toolbar button:hover, .ql-snow.ql-toolbar button:focus, .ql-snow .ql-toolbar button:focus, .ql-snow.ql-toolbar button.ql-active, .ql-snow .ql-toolbar button.ql-active, .ql-snow.ql-toolbar .ql-picker-label:hover,  .ql-snow.ql-toolbar .ql-picker-label:focus, .ql-snow .ql-toolbar .ql-picker-label:hover, .ql-snow.ql-toolbar .ql-picker-label.ql-active, .ql-snow .ql-toolbar .ql-picker-label.ql-active,  .ql-snow .ql-toolbar .ql-picker-label:focus, .ql-snow.ql-toolbar .ql-picker-item:hover, .ql-snow .ql-toolbar .ql-picker-item:hover, .ql-snow.ql-toolbar .ql-picker-item.ql-selected, .ql-snow.ql-toolbar .ql-picker-item:focus, .ql-snow .ql-toolbar .ql-picker-item.ql-selected {
    color: ${colors.clBlue};
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

  &.focussed:not(.error) .ql-toolbar.ql-snow + .ql-container.ql-snow {
    border-color: #000;
  }

  &.error .ql-toolbar.ql-snow + .ql-container.ql-snow {
    border-color: ${colors.clRedError};
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

export interface Props {
  id: string;
  value?: string;
  label?: string | JSX.Element | null;
  labelTooltipText?: string | JSX.Element | null;
  locale?: Locale;
  placeholder?: string;
  noToolbar?: boolean;
  noImages?: boolean;
  noVideos?: boolean;
  noAlign?: boolean;
  limitedTextFormatting?: boolean;
  hasError?: boolean;
  className?: string;
  onChange?: (html: string, locale: Locale | undefined) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  setRef?: (arg: HTMLDivElement) => void | undefined;
}

Quill.register('modules/blotFormatter', BlotFormatter);

// BEGIN allow image alignment styles
const attributes = [
  'alt',
  'width',
  'height',
  'style'
];

const BaseImageFormat = Quill.import('formats/image');
const BaseVideoFormat = Quill.import('formats/video');

class ImageFormat extends BaseImageFormat {
  static formats(domNode) {
    return attributes.reduce((formats, attribute) => {
      if (domNode.hasAttribute(attribute)) {
        formats[attribute] = domNode.getAttribute(attribute);
      }
      return formats;
    }, {});
  }
  format(name, value) {
    if (attributes.indexOf(name) > -1) {
      if (value) {
        this.domNode.setAttribute(name, value);
      } else {
        this.domNode.removeAttribute(name);
      }
    } else {
      super.format(name, value);
    }
  }
}
ImageFormat.blotName = 'image';
ImageFormat.tagName = 'img';
Quill.register(ImageFormat, true);

class VideoFormat extends BaseVideoFormat {
  static formats(domNode) {
    return attributes.reduce((formats, attribute) => {
      if (domNode.hasAttribute(attribute)) {
        formats[attribute] = domNode.getAttribute(attribute);
      }
      return formats;
    }, {});
  }
  format(name, value) {
    if (attributes.indexOf(name) > -1) {
      if (value) {
        this.domNode.setAttribute(name, value);
      } else {
        this.domNode.removeAttribute(name);
      }
    } else {
      super.format(name, value);
    }
  }
}
VideoFormat.blotName = 'video';
VideoFormat.tagName = 'iframe';
Quill.register(VideoFormat, true);
// END allow image & video resizing styles

const QuillEditor = memo<Props & InjectedIntlProps>(({
  id,
  value,
  label,
  labelTooltipText,
  locale,
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
  onBlur,
  onFocus,
  intl: {
    formatMessage
  },
  children
}) => {
  const toolbarId = !noToolbar ? `ql-editor-toolbar-${id}` : null;

  const [editor, setEditor] = useState<Quill | null>(null);
  const contentRef = useRef<string>(value || '');
  const prevEditor = usePrevious(editor);
  const [focussed, setFocussed] = useState(false);
  const prevFocussed = usePrevious(focussed);
  const editorRef = useRef<HTMLDivElement>(null);

  // initialize quill
  useEffect(() => {
    if (!editor && editorRef && editorRef.current) {
      const editorOptions: QuillOptionsStatic = {
        bounds: editorRef.current,
        formats: [
          'bold',
          'italic',
          'link',
          ...attributes,
          ...(!limitedTextFormatting ? ['header', 'list'] : []),
          ...(!limitedTextFormatting && !noAlign ? ['align'] : []),
          ...(!noImages ? ['image'] : []),
          ...(!noVideos ? ['video'] : [])
        ],
        theme: 'snow',
        placeholder: placeholder || '',
        modules: {
          blotFormatter: !noImages || !noVideos ? true : false,
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
            matchVisual: false
          },
        },
      };

      setEditor(new Quill(editorRef.current, editorOptions));
    }
  }, [placeholder, noAlign, noImages, noVideos, limitedTextFormatting, toolbarId, editor, editorRef]);

  useEffect(() => {
    if (!prevEditor && editor && editorRef?.current) {
      editorRef.current.getElementsByClassName('ql-editor')[0].setAttribute('name', id);
      editorRef.current.getElementsByClassName('ql-editor')[0].setAttribute('id', id);
      editorRef.current.getElementsByClassName('ql-editor')[0].setAttribute('aria-labelledby', id);
      editorRef.current.getElementsByClassName('ql-editor')[0].setAttribute('aria-multiline', 'true');
      editorRef.current.getElementsByClassName('ql-editor')[0].setAttribute('role', 'textbox');
    }

    if ((!prevEditor && editor && value) || (prevEditor && editor && value !== contentRef.current)) {
      const delta = editor.clipboard.convert(value);
      editor.setContents(delta);
      contentRef.current = editor.root.innerHTML;
    }
  }, [editor, value]);

  useEffect(() => {
    const textChangeHandler = () => {
      if (editor) {
        const html = editor.root.innerHTML === '<p><br></p>' ? '' : editor.root.innerHTML;

        if (html !== contentRef.current) {
          contentRef.current = html;
          onChange && onChange(html, locale);
        }
      }
    };

    const selectionChangeHandler = (range: RangeStatic, oldRange: RangeStatic, _source: Sources) => {
      if (range === null && oldRange !== null) {
        setFocussed(false);
      } else if (range !== null && oldRange === null) {
        setFocussed(true);
      }
    };

    const debouncedTextChangeHandler = debounce(textChangeHandler, 100);

    if (editor) {
      editor.on('text-change', debouncedTextChangeHandler);
      editor.on('selection-change', selectionChangeHandler);
      setRef && setRef(editor.root);
    }

    return () => {
      if (editor) {
        editor.off('text-change', debouncedTextChangeHandler);
        editor.off('selection-change', selectionChangeHandler);
      }
    };
  }, [editor, locale, onChange]);

  useEffect(() => {
    if (!prevFocussed && focussed && onFocus) {
      onFocus();
    }

    if (prevFocussed && !focussed && onBlur) {
      onBlur();
    }
  }, [focussed, onFocus, onBlur]);

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

  const handleLabelOnClick = useCallback(() => {
    editor && editor.focus();
  }, [editor]);

  const classNames = [
    className,
    focussed ? 'focussed' : null,
    hasError ? 'error' : null
  ].filter(className => className).join(' ');

  return (
    <Container
      className={classNames}
      videoPrompt={formatMessage(messages.videoPrompt)}
      linkPrompt={formatMessage(messages.linkPrompt)}
      visitPrompt={formatMessage(messages.visitPrompt)}
      save={formatMessage(messages.save)}
      edit={formatMessage(messages.edit)}
      remove={formatMessage(messages.remove)}
    >
      {label &&
        <Label htmlFor={id} onClick={handleLabelOnClick}>
          <span>{label}</span>
          {labelTooltipText && <IconTooltip content={labelTooltipText} />}
        </Label>
      }

      {!noToolbar &&
        <div id={toolbarId || ''} >
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

          <span className="ql-formats">
            <button className="ql-bold" onClick={trackBasic('bold')} aria-label={formatMessage(messages.bold)} />
            <button className="ql-italic" onClick={trackBasic('italic')} aria-label={formatMessage(messages.italic)} />
            <button className="ql-link" onClick={trackBasic('link')} aria-label={formatMessage(messages.link)} />
          </span>

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

          {!(noImages && noVideos) &&
            <span className="ql-formats">
              {!noImages && <button className="ql-image" onClick={trackImage} aria-label={formatMessage(messages.image)} />}
              {!noVideos && <button className="ql-video" onClick={trackVideo} aria-label={formatMessage(messages.video)} />}
            </span>
          }
        </div>
      }
      <div ref={editorRef}>
        {children}
      </div>
    </Container>
  );
});

export default injectIntl(QuillEditor);
