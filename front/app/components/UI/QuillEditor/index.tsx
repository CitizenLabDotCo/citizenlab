import React, { memo, useEffect, useRef, useState, useCallback } from 'react';
import usePrevious from 'hooks/usePrevious';
import { debounce } from 'lodash-es';

// quill
import Quill, { Sources, QuillOptionsStatic, RangeStatic } from 'quill';
import BlotFormatter from 'quill-blot-formatter';
import 'quill/dist/quill.snow.css';

// components
import { Label, IconTooltip } from 'cl2-component-library';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// styling
import styled from 'styled-components';
import {
  colors,
  quillEditedContent,
  media,
  fontSizes,
  defaultStyles,
} from 'utils/styleUtils';

// typings
import { Locale } from 'typings';
import Tippy from '@tippyjs/react';

const DropdownList = styled.div`
  display: flex;
  flex-direction: column;
  width: auto;
  margin-top: 5px;
  margin-bottom: 5px;
`;

const DropdownListItem = styled.button`
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: ${colors.text};
  font-size: ${fontSizes.small}px;
  font-weight: 400;
  white-space: nowrap;
  width: auto !important;
  padding: 10px;
  border-radius: ${(props: any) => props.theme.borderRadius};
  cursor: pointer;
  white-space: nowrap;
  text-align: left;

  &:hover,
  &:focus {
    outline: none;
    color: white;
    background: ${colors.adminMenuBackground};
  }
`;

const Container = styled.div<{
  videoPrompt: string;
  linkPrompt: string;
  visitPrompt: string;
  save: string;
  edit: string;
  remove: string;
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
    content: '${(props) => props.linkPrompt}' !important;
  }

  .ql-tooltip[data-mode=video]::before {
    content: '${(props) => props.videoPrompt}' !important;
  }

  .ql-tooltip::before {
    content: '${(props) => props.visitPrompt}' !important;
  }

  .ql-tooltip.ql-editing a.ql-action::after {
    content: '${(props) => props.save}' !important;
  }

  .ql-tooltip a.ql-action::after {
    content: '${(props) => props.edit}' !important;
  }

  .ql-tooltip a.ql-remove::before {
    content: '${(props) => props.remove}' !important;
  }

  .ql-tooltip.ql-editing input {
    font-size: 16px !important;
    font-weight: 400 !important;
  }

  span.ql-formats:last-child {
    margin-right: 0;
  }

  .ql-toolbar.ql-snow {
    background: #f8f8f8;
    border-radius: ${({ theme }) => theme.borderRadius} ${({ theme }) =>
  theme.borderRadius} 0 0;
    box-shadow: none;
    border: 1px solid ${colors.border};
    border-bottom: 0;
    transition: box-shadow 100ms ease-out;
  }

  &.focus:not(.error) .ql-toolbar.ql-snow + .ql-container.ql-snow {
    border-color: ${colors.focussedBorder};
    box-shadow: inset ${defaultStyles.boxShadowFocused};
  }

  &.error .ql-toolbar.ql-snow + .ql-container.ql-snow {
    border-color: ${colors.clRedError};
  }

  &.error.focus .ql-toolbar.ql-snow + .ql-container.ql-snow {
    border-color: ${colors.clRedError};
    box-shadow: inset ${defaultStyles.boxShadowError};
  }

  .ql-toolbar.ql-snow + .ql-container.ql-snow {
    width: 100%;
    height: 100%;
    max-height: ${({ theme: { menuHeight } }) =>
      `calc(80vh - ${menuHeight}px)`};
    cursor: text;
    border-radius: 0 0 ${({ theme }) => theme.borderRadius} ${({ theme }) =>
  theme.borderRadius};
    border: 1px solid ${colors.border};
    box-shadow: none;
    overflow-y: auto;
    ${(props: any) => quillEditedContent(props.theme.colorMain)};

    .ql-editor {
      min-height: 300px;
    }

    ${media.smallerThanMaxTablet`
      max-height: ${({ theme: { mobileMenuHeight } }) =>
        `calc(80vh - ${mobileMenuHeight}px)`};
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
  withCTAButton?: boolean;
}

Quill.register('modules/blotFormatter', BlotFormatter);

// BEGIN allow image alignment styles
const attributes = ['alt', 'width', 'height', 'style'];

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

// BEGIN custom button implementation
const Inline = Quill.import('blots/inline');

class CustomButton extends Inline {
  static create(value) {
    const node = super.create();
    node.setAttribute('href', value);
    node.setAttribute('rel', 'noorefferer');
    return node;
  }

  static formats(node) {
    return node.getAttribute('href');
  }
}
CustomButton.blotName = 'button';
CustomButton.tagName = 'a';
CustomButton.className = 'custom-button';

Quill.register(CustomButton);
// END custom button implementation

const QuillEditor = memo<Props & InjectedIntlProps>(
  ({
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
    withCTAButton,
    intl: { formatMessage },
    children,
  }) => {
    const toolbarId = !noToolbar ? `ql-editor-toolbar-${id}` : null;

    const [editor, setEditor] = useState<Quill | null>(null);
    const contentRef = useRef<string>(value || '');
    const prevEditor = usePrevious(editor);
    const [focussed, setFocussed] = useState(false);
    const prevFocussed = usePrevious(focussed);
    const editorRef = useRef<HTMLDivElement>(null);
    const [isButtonsMenuVisible, setIsButtonsMenuVisible] = useState(false);

    const toggleButtonsMenu = useCallback(
      () => setIsButtonsMenuVisible((value) => !value),
      []
    );
    const hideButtonsMenu = useCallback(
      () => setIsButtonsMenuVisible(false),
      []
    );

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
            ...(withCTAButton ? ['button'] : []),
            ...(!limitedTextFormatting ? ['header', 'list'] : []),
            ...(!limitedTextFormatting && !noAlign ? ['align'] : []),
            ...(!noImages ? ['image'] : []),
            ...(!noVideos ? ['video'] : []),
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
                  handler: () => true, // do nothing
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
        };

        setEditor(new Quill(editorRef.current, editorOptions));
      }
    }, [
      placeholder,
      noAlign,
      noImages,
      noVideos,
      limitedTextFormatting,
      toolbarId,
      editor,
      editorRef,
    ]);

    useEffect(() => {
      if (!prevEditor && editor && editorRef?.current) {
        editorRef.current
          .getElementsByClassName('ql-editor')[0]
          .setAttribute('name', id);
        editorRef.current
          .getElementsByClassName('ql-editor')[0]
          .setAttribute('id', id);
        editorRef.current
          .getElementsByClassName('ql-editor')[0]
          .setAttribute('aria-labelledby', id);
        editorRef.current
          .getElementsByClassName('ql-editor')[0]
          .setAttribute('aria-multiline', 'true');
        editorRef.current
          .getElementsByClassName('ql-editor')[0]
          .setAttribute('role', 'textbox');
      }

      if (
        (!prevEditor && editor && value) ||
        (prevEditor && editor && value !== contentRef.current)
      ) {
        const delta = editor.clipboard.convert(value);
        editor.setContents(delta);
        contentRef.current = editor.root.innerHTML;
      }
    }, [editor, value]);

    useEffect(() => {
      const textChangeHandler = () => {
        if (editor) {
          const html =
            editor.root.innerHTML === '<p><br></p>'
              ? ''
              : editor.root.innerHTML;

          if (html !== contentRef.current) {
            contentRef.current = html;
            onChange && onChange(html, locale);
          }
        }
      };

      const selectionChangeHandler = (
        range: RangeStatic,
        oldRange: RangeStatic,
        _source: Sources
      ) => {
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

    const trackAdvanced = (type, option) => (
      _event: React.MouseEvent<HTMLElement>
    ) => {
      trackEventByName(tracks.advancedEditing.name, {
        extra: {
          type,
          option,
        },
      });
    };

    const trackClickDropdown = (event: React.MouseEvent<HTMLElement>) => {
      if (
        event.currentTarget &&
        event.currentTarget.classList.contains('ql-picker-item')
      ) {
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

    const handleCustomLink = useCallback(() => {
      if (!editor) return;

      const selection = editor.getSelection();

      if (selection && selection.length > 0) {
        trackBasic('custom-link');
        const value = prompt(formatMessage(messages.customLinkPrompt));
        editor.format('button', value);
        setIsButtonsMenuVisible(false);
      }
    }, [editor]);

    const handleNormalLink = useCallback(() => {
      if (!editor) return;

      const selection = editor.getSelection();

      // copied from the snow toolbar code
      // to manually add the handler that would have been callen on the toolbar button
      if (selection == null || selection.length === 0) return;
      const preview = editor.getText(selection as any);
      const tooltip = (editor as any).theme.tooltip;
      tooltip.edit('link', preview);
      setIsButtonsMenuVisible(false);
    }, [editor]);

    const classNames = [
      className,
      focussed ? 'focus' : null,
      hasError ? 'error' : null,
    ]
      .filter((className) => className)
      .join(' ');

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
        {label && (
          <Label htmlFor={id} onClick={handleLabelOnClick}>
            <span>{label}</span>
            {labelTooltipText && <IconTooltip content={labelTooltipText} />}
          </Label>
        )}

        {!noToolbar && (
          <div id={toolbarId || ''}>
            {!limitedTextFormatting && (
              <span
                className="ql-formats"
                role="button"
                onClick={trackClickDropdown}
              >
                <select className="ql-header" defaultValue={''}>
                  <option value="2" aria-selected={false}>
                    {formatMessage(messages.title)}
                  </option>
                  <option value="3" aria-selected={false}>
                    {formatMessage(messages.subtitle)}
                  </option>
                  <option value="" aria-selected>
                    {formatMessage(messages.normalText)}
                  </option>
                </select>
              </span>
            )}
            <span className="ql-formats">
              <button
                className="ql-bold"
                onClick={trackBasic('bold')}
                aria-label={formatMessage(messages.bold)}
              />
              <button
                className="ql-italic"
                onClick={trackBasic('italic')}
                aria-label={formatMessage(messages.italic)}
              />
              {withCTAButton ? (
                <Tippy
                  placement="bottom"
                  theme="light"
                  interactive={true}
                  visible={isButtonsMenuVisible}
                  onClickOutside={hideButtonsMenu}
                  duration={[200, 0]}
                  popperOptions={{
                    strategy: 'fixed',
                  }}
                  content={
                    <DropdownList>
                      <DropdownListItem
                        onClick={handleCustomLink}
                        type="button"
                      >
                        {formatMessage(messages.customLink)}
                      </DropdownListItem>
                      <DropdownListItem
                        onClick={handleNormalLink}
                        type="button"
                        className="ql-link"
                      >
                        {formatMessage(messages.link)}
                      </DropdownListItem>
                    </DropdownList>
                  }
                >
                  <button type="button" onClick={toggleButtonsMenu}>
                    <svg viewBox="0 0 18 18">
                      <line
                        className="ql-stroke"
                        x1="7"
                        x2="11"
                        y1="7"
                        y2="11"
                      />
                      <path
                        className="ql-even ql-stroke"
                        d="M8.9,4.577a3.476,3.476,0,0,1,.36,4.679A3.476,3.476,0,0,1,4.577,8.9C3.185,7.5,2.035,6.4,4.217,4.217S7.5,3.185,8.9,4.577Z"
                      />
                      <path
                        className="ql-even ql-stroke"
                        d="M13.423,9.1a3.476,3.476,0,0,0-4.679-.36,3.476,3.476,0,0,0,.36,4.679c1.392,1.392,2.5,2.542,4.679.36S14.815,10.5,13.423,9.1Z"
                      />
                    </svg>
                  </button>
                </Tippy>
              ) : (
                <button
                  className="ql-link"
                  onClick={trackBasic('link')}
                  aria-label={formatMessage(messages.link)}
                />
              )}
            </span>

            {!limitedTextFormatting && !noAlign && (
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
            )}

            {!limitedTextFormatting && (
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
            )}

            {!(noImages && noVideos) && (
              <span className="ql-formats">
                {!noImages && (
                  <button
                    className="ql-image"
                    onClick={trackImage}
                    aria-label={formatMessage(messages.image)}
                  />
                )}
                {!noVideos && (
                  <button
                    className="ql-video"
                    onClick={trackVideo}
                    aria-label={formatMessage(messages.video)}
                  />
                )}
              </span>
            )}

            <span className="ql-formats">
              <button
                className="ql-clean"
                aria-label={formatMessage(messages.clean)}
              />
            </span>
          </div>
        )}
        <div ref={editorRef}>{children}</div>
      </Container>
    );
  }
);

export default injectIntl(QuillEditor);
