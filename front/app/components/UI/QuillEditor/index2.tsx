// import React, { memo, useEffect, useRef, useState, useCallback } from 'react';

// import {
//   Label,
//   IconTooltip,
//   colors,
//   quillEditedContent,
//   media,
//   defaultStyles,
//   isRtl,
// } from '@citizenlab/cl2-component-library';
// import { debounce } from 'lodash-es';
// import Quill, { Sources, QuillOptionsStatic, RangeStatic } from 'quill';
// import styled from 'styled-components';
// import { SupportedLocale } from 'typings';

// import usePrevious from 'hooks/usePrevious';

// import { trackEventByName } from 'utils/analytics';
// import { useIntl } from 'utils/cl-intl';

// import 'quill/dist/quill.snow.css';

// import { attributes } from './altTextToImagesModule';
// import { configureQuill } from './configureQuill';
// import messages from './messages';
// import Toolbar from './Toolbar';
// import tracks from './tracks';

// const Container = styled.div<{
//   videoPrompt: string;
//   linkPrompt: string;
//   visitPrompt: string;
//   save: string;
//   edit: string;
//   remove: string;
//   maxHeight?: string;
//   minHeight?: string;
//   scrollTop: number;
// }>`
//   .ql-snow.ql-toolbar button:hover .ql-stroke,
//   .ql-snow .ql-toolbar button:hover .ql-stroke,
//   .ql-snow.ql-toolbar button:focus .ql-stroke,
//   .ql-snow .ql-toolbar button:focus .ql-stroke,
//   .ql-snow.ql-toolbar button.ql-active .ql-stroke,
//   .ql-snow .ql-toolbar button.ql-active .ql-stroke,
//   .ql-snow.ql-toolbar .ql-picker-label:hover .ql-stroke,
//   .ql-snow .ql-toolbar .ql-picker-label:hover .ql-stroke,
//   .ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-stroke,
//   .ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-stroke,
//   .ql-snow.ql-toolbar .ql-picker-item:hover .ql-stroke,
//   .ql-snow .ql-toolbar .ql-picker-item:hover .ql-stroke,
//   .ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-stroke,
//   .ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-stroke,
//   .ql-snow.ql-toolbar button:hover .ql-stroke-miter,
//   .ql-snow .ql-toolbar button:hover .ql-stroke-miter,
//   .ql-snow.ql-toolbar button:focus .ql-stroke-miter,
//   .ql-snow .ql-toolbar button:focus .ql-stroke-miter,
//   .ql-snow.ql-toolbar button.ql-active .ql-stroke-miter,
//   .ql-snow .ql-toolbar button.ql-active .ql-stroke-miter,
//   .ql-snow.ql-toolbar .ql-picker-label:hover .ql-stroke-miter,
//   .ql-snow .ql-toolbar .ql-picker-label:hover .ql-stroke-miter,
//   .ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-stroke-miter,
//   .ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-stroke-miter,
//   .ql-snow.ql-toolbar .ql-picker-item:hover .ql-stroke-miter,
//   .ql-snow .ql-toolbar .ql-picker-item:hover .ql-stroke-miter,
//   .ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-stroke-miter,
//   .ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-stroke-miter,
//   .ql-picker-label:focus .ql-stroke,
//   .ql-picker-item:focus .ql-stroke {
//     stroke: ${colors.teal};
//   }

//   .ql-snow.ql-toolbar button:hover .ql-fill,
//   .ql-snow .ql-toolbar button:hover .ql-fill,
//   .ql-snow.ql-toolbar button:focus .ql-fill,
//   .ql-snow .ql-toolbar button:focus .ql-fill,
//   .ql-snow.ql-toolbar button.ql-active .ql-fill,
//   .ql-snow .ql-toolbar button.ql-active .ql-fill,
//   .ql-snow.ql-toolbar .ql-picker-label:hover .ql-fill,
//   .ql-snow .ql-toolbar .ql-picker-label:hover .ql-fill,
//   .ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-fill,
//   .ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-fill,
//   .ql-snow.ql-toolbar .ql-picker-item:hover .ql-fill,
//   .ql-snow .ql-toolbar .ql-picker-item:hover .ql-fill,
//   .ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-fill,
//   .ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-fill,
//   .ql-snow.ql-toolbar button:hover .ql-stroke.ql-fill,
//   .ql-snow .ql-toolbar button:hover .ql-stroke.ql-fill,
//   .ql-snow.ql-toolbar button:focus .ql-stroke.ql-fill,
//   .ql-snow .ql-toolbar button:focus .ql-stroke.ql-fill,
//   .ql-snow.ql-toolbar button.ql-active .ql-stroke.ql-fill,
//   .ql-snow .ql-toolbar button.ql-active .ql-stroke.ql-fill,
//   .ql-snow.ql-toolbar .ql-picker-label:hover .ql-stroke.ql-fill,
//   .ql-snow .ql-toolbar .ql-picker-label:hover .ql-stroke.ql-fill,
//   .ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-stroke.ql-fill,
//   .ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-stroke.ql-fill,
//   .ql-snow.ql-toolbar .ql-picker-item:hover .ql-stroke.ql-fill,
//   .ql-snow .ql-toolbar .ql-picker-item:hover .ql-stroke.ql-fill,
//   .ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-stroke.ql-fill,
//   .ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-stroke.ql-fill,
//   .ql-snow.ql-toolbar .ql-picker-label:focus .ql-stroke.ql-fill,
//   .ql-snow.ql-toolbar .ql-picker-item:focus .ql-stroke.ql-fill {
//     fill: ${colors.teal};
//   }

//   .ql-snow.ql-toolbar button:hover,
//   .ql-snow .ql-toolbar button:hover,
//   .ql-snow.ql-toolbar button:focus,
//   .ql-snow .ql-toolbar button:focus,
//   .ql-snow.ql-toolbar button.ql-active,
//   .ql-snow .ql-toolbar button.ql-active,
//   .ql-snow.ql-toolbar .ql-picker-label:hover,
//   .ql-snow.ql-toolbar .ql-picker-label:focus,
//   .ql-snow .ql-toolbar .ql-picker-label:hover,
//   .ql-snow.ql-toolbar .ql-picker-label.ql-active,
//   .ql-snow .ql-toolbar .ql-picker-label.ql-active,
//   .ql-snow .ql-toolbar .ql-picker-label:focus,
//   .ql-snow.ql-toolbar .ql-picker-item:hover,
//   .ql-snow .ql-toolbar .ql-picker-item:hover,
//   .ql-snow.ql-toolbar .ql-picker-item.ql-selected,
//   .ql-snow.ql-toolbar .ql-picker-item:focus,
//   .ql-snow .ql-toolbar .ql-picker-item.ql-selected {
//     color: ${colors.teal};
//   }

//   .ql-tooltip {
//     top: ${(props) => props.scrollTop + 20}px !important;
//     left: 50% !important;
//     transform: translate(-50%);
//   }

//   .ql-tooltip[data-mode='link']::before {
//     content: '${(props) => props.linkPrompt}' !important;
//   }

//   .ql-tooltip[data-mode='video']::before {
//     content: '${(props) => props.videoPrompt}' !important;
//   }

//   .ql-tooltip::before {
//     content: '${(props) => props.visitPrompt}' !important;
//   }

//   .ql-tooltip.ql-editing a.ql-action::after {
//     content: '${(props) => props.save}' !important;
//   }

//   .ql-tooltip a.ql-action::after {
//     content: '${(props) => props.edit}' !important;
//   }

//   .ql-tooltip a.ql-remove::before {
//     content: '${(props) => props.remove}' !important;
//   }

//   .ql-tooltip.ql-editing input {
//     font-size: 16px !important;
//     font-weight: 400 !important;
//   }

//   span.ql-formats:last-child {
//     margin-right: 0;
//   }

//   .ql-toolbar.ql-snow {
//     background: #f8f8f8;
//     border-radius: ${({ theme }) => theme.borderRadius}
//       ${({ theme }) => theme.borderRadius} 0 0;
//     box-shadow: none;
//     border: 1px solid ${colors.borderDark};
//     border-bottom: 0;
//     transition: box-shadow 100ms ease-out;
//   }

//   &.focus:not(.error) .ql-toolbar.ql-snow + .ql-container.ql-snow {
//     border-color: ${colors.black};
//     box-shadow: inset ${defaultStyles.boxShadowFocused};
//   }

//   &.error .ql-toolbar.ql-snow + .ql-container.ql-snow {
//     border-color: ${colors.red600};
//   }

//   &.error.focus .ql-toolbar.ql-snow + .ql-container.ql-snow {
//     border-color: ${colors.red600};
//     box-shadow: inset ${defaultStyles.boxShadowError};
//   }

//   // This fixes a wierd scroll to the top after pasting. See https://github.com/quilljs/quill/issues/1374
//   .ql-clipboard {
//     position: fixed;
//     display: none;
//     left: 50%;
//     top: 50%;
//   }

//   .ql-toolbar.ql-snow + .ql-container.ql-snow {
//     width: 100%;
//     height: 100%;
//     cursor: text;
//     border-radius: 0 0 ${({ theme }) => theme.borderRadius}
//       ${({ theme }) => theme.borderRadius};
//     border: 1px solid ${colors.borderDark};
//     box-shadow: none;
//     overflow-y: auto;
//     ${(props) => quillEditedContent(props.theme.colors.tenantPrimary)};

//     .ql-editor {
//       min-height: ${(props) => (props.minHeight ? props.minHeight : '300px')};
//     }
//       max-height: ${(props) =>
//     props.maxHeight
//       ? props.maxHeight
//       : ({ theme: { menuHeight } }) => `calc(80vh - ${menuHeight}px)`};
//       ${isRtl`
// 	direction: rtl;
// 	text-align: right;
//     `}
//     }

//     ${media.tablet`
//       max-height: ${({ theme: { mobileMenuHeight } }) =>
//       `calc(80vh - ${mobileMenuHeight}px)`};
//     `}
//   }
// `;

// export interface Props {
//   id: string;
//   value?: string;
//   label?: string | JSX.Element | null;
//   labelTooltipText?: string | JSX.Element | null;
//   locale?: SupportedLocale;
//   placeholder?: string;
//   noToolbar?: boolean;
//   noImages?: boolean;
//   noVideos?: boolean;
//   noAlign?: boolean;
//   limitedTextFormatting?: boolean;
//   hasError?: boolean;
//   className?: string;
//   maxHeight?: string;
//   minHeight?: string;
//   onChange?: (html: string, locale: SupportedLocale | undefined) => void;
//   onFocus?: () => void;
//   onBlur?: () => void;
//   setRef?: (arg: HTMLDivElement) => void | undefined;
//   withCTAButton?: boolean;
// }

// configureQuill();

// const QuillEditor = memo<Props>(
//   ({
//     id,
//     value,
//     label,
//     labelTooltipText,
//     locale,
//     placeholder,
//     noToolbar,
//     noAlign,
//     noImages,
//     noVideos,
//     limitedTextFormatting,
//     maxHeight,
//     minHeight,
//     hasError,
//     className,
//     setRef,
//     onChange,
//     onBlur,
//     onFocus,
//     withCTAButton,
//     children,
//   }) => {
//     const toolbarId = !noToolbar ? `ql-editor-toolbar-${id}` : undefined;
//     const { formatMessage } = useIntl();
//     const [editor, setEditor] = useState<Quill | null>(null);
//     const [scrollTop, setScrollTop] = useState<number>(0);
//     const contentRef = useRef<string>(value || '');
//     const prevEditor = usePrevious(editor);
//     const [focussed, setFocussed] = useState(false);
//     const prevFocussed = usePrevious(focussed);
//     const editorRef = useRef<HTMLDivElement>(null);
//     const [isButtonsMenuVisible, setIsButtonsMenuVisible] = useState(false);

//     useEffect(() => {
//       const eventListenerHandler = debounce(() => {
//         setScrollTop(editorRef.current?.scrollTop || 0);
//       }, 100);
//       const scrollContainer = editorRef.current;
//       if (scrollContainer) {
//         scrollContainer.addEventListener('scroll', eventListenerHandler);
//       }
//       return () => {
//         scrollContainer?.removeEventListener('scroll', eventListenerHandler);
//       };
//     }, []);

//     // initialize quill
//     useEffect(() => {
//       if (!editor && editorRef && editorRef.current) {
//         const editorOptions: QuillOptionsStatic = {
//           bounds: editorRef.current,
//           formats: [
//             'bold',
//             'italic',
//             'link',
//             ...attributes,
//             ...(withCTAButton ? ['button'] : []),
//             ...(!limitedTextFormatting ? ['header', 'list'] : []),
//             ...(!limitedTextFormatting && !noAlign ? ['align'] : []),
//             ...(!noImages ? ['image'] : []),
//             ...(!noVideos ? ['video'] : []),
//           ],
//           theme: 'snow',
//           placeholder: placeholder || '',
//           modules: {
//             altTextToImages: true,
//             blotFormatter: !noImages || !noVideos ? true : false,
//             toolbar: toolbarId ? `#${toolbarId}` : false,
//             keyboard: {
//               bindings: {
//                 // overwrite default tab behavior
//                 tab: {
//                   key: 9,
//                   handler: () => {
//                     onBlur && onBlur();
//                     return true;
//                   }, // do nothing
//                 },
//                 'remove tab': {
//                   key: 9,
//                   shiftKey: true,
//                   collapsed: true,
//                   prefix: /\t$/,
//                   handler: () => true, // do nothing
//                 },
//               },
//             },
//             clipboard: {
//               matchVisual: false,
//             },
//           },
//         };

//         setEditor(new Quill(editorRef.current, editorOptions));
//       }
//       // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [
//       placeholder,
//       noAlign,
//       noImages,
//       noVideos,
//       limitedTextFormatting,
//       toolbarId,
//       editor,
//       editorRef,
//       onBlur,
//     ]);

//     useEffect(() => {
//       if (!prevEditor && editor && editorRef?.current) {
//         editorRef.current
//           .getElementsByClassName('ql-editor')[0]
//           .setAttribute('name', id);
//         editorRef.current
//           .getElementsByClassName('ql-editor')[0]
//           .setAttribute('id', id);
//         editorRef.current
//           .getElementsByClassName('ql-editor')[0]
//           .setAttribute('aria-labelledby', id);
//         editorRef.current
//           .getElementsByClassName('ql-editor')[0]
//           .setAttribute('aria-multiline', 'true');
//         editorRef.current
//           .getElementsByClassName('ql-editor')[0]
//           .setAttribute('role', 'textbox');
//       }

//       if (
//         (!prevEditor && editor && value) ||
//         (prevEditor && editor && value !== contentRef.current)
//       ) {
//         const delta = editor.clipboard.convert(value as any);
//         editor.setContents(delta);
//         contentRef.current = editor.root.innerHTML;
//       }
//       // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [editor, value]);

//     useEffect(() => {
//       const textChangeHandler = () => {
//         if (editor) {
//           const html =
//             editor.root.innerHTML === '<p><br></p>'
//               ? ''
//               : editor.root.innerHTML;

//           if (html !== contentRef.current) {
//             contentRef.current = html;
//             onChange && onChange(html, locale);
//           }
//         }
//       };

//       const selectionChangeHandler = (
//         range: RangeStatic,
//         oldRange: RangeStatic,
//         _source: Sources
//       ) => {
//         if (range === null && oldRange !== null) {
//           setFocussed(false);
//         } else if (range !== null && oldRange === null) {
//           setFocussed(true);
//         }
//       };
//       const debouncedTextChangeHandler = debounce(textChangeHandler, 100);
//       if (editor) {
//         editor.on('text-change', debouncedTextChangeHandler);
//         editor.on('selection-change', selectionChangeHandler);
//         setRef && setRef(editor.root);
//       }

//       return () => {
//         if (editor) {
//           editor.off('text-change', debouncedTextChangeHandler);
//           editor.off('selection-change', selectionChangeHandler);
//         }
//       };
//       // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [editor, locale, onChange]);

//     useEffect(() => {
//       if (!prevFocussed && focussed && onFocus) {
//         onFocus();
//       }

//       if (prevFocussed && !focussed && onBlur) {
//         onBlur();
//       }
//       // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [focussed, onFocus, onBlur]);

//     useEffect(() => {
//       if (editor) {
//         const altInputs = document.getElementsByClassName(
//           'ql-alt-text-input'
//         ) as HTMLCollectionOf<HTMLInputElement>;
//         for (const input of altInputs) {
//           if (!input.placeholder) {
//             input.setAttribute(
//               'placeholder',
//               formatMessage(messages.altTextPlaceholder)
//             );
//             input.setAttribute(
//               'aria-label',
//               formatMessage(messages.altTextPlaceholder)
//             );
//           }
//         }
//       }
//     }, [editor, formatMessage, value]);

//     const trackBasic =
//       (type: 'bold' | 'italic' | 'custom-link' | 'link') =>
//         (_event: React.MouseEvent<HTMLElement>) => {
//           trackEventByName(tracks.basicEditing.name, {
//             extra: {
//               type,
//             },
//           });
//         };

//     const handleLabelOnClick = useCallback(() => {
//       editor && editor.focus();
//     }, [editor]);

//     const handleCustomLink = useCallback(() => {
//       if (!editor) return;

//       const selection = editor.getSelection();

//       if (selection && selection.length > 0) {
//         trackBasic('custom-link');
//         const value = prompt(formatMessage(messages.customLinkPrompt));
//         editor.format('button', value);
//         setIsButtonsMenuVisible(false);
//       }
//       // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [editor]);

//     const handleNormalLink = useCallback(() => {
//       if (!editor) return;

//       const selection = editor.getSelection();

//       // copied from the snow toolbar code
//       // to manually add the handler that would have been callen on the toolbar button
//       if (selection == null || selection.length === 0) return;
//       const preview = editor.getText(selection as any);
//       const tooltip = (editor as any).theme.tooltip;
//       tooltip.edit('link', preview);
//       setIsButtonsMenuVisible(false);
//     }, [editor]);

//     const classNames = [
//       className,
//       focussed ? 'focus' : null,
//       hasError ? 'error' : null,
//     ]
//       .filter((className) => className)
//       .join(' ');

//     // Function to save the latest state of the content.
//     // We call this when the mouse leaves the editor, to ensure the
//     // latest content (and image size + alt text) is properly saved.
//     const saveLatestContent = () => {
//       if (editor) {
//         const html = editor.root.innerHTML;
//         contentRef.current = html;
//         onChange?.(html, locale);
//       }
//     };

//     return (
//       <Container
//         maxHeight={maxHeight}
//         minHeight={minHeight}
//         className={classNames}
//         videoPrompt={formatMessage(messages.videoPrompt)}
//         linkPrompt={formatMessage(messages.linkPrompt)}
//         visitPrompt={formatMessage(messages.visitPrompt)}
//         save={formatMessage(messages.save)}
//         edit={formatMessage(messages.edit)}
//         remove={formatMessage(messages.remove)}
//         scrollTop={scrollTop}
//         onMouseLeave={saveLatestContent}
//       >
//         {label && (
//           <Label htmlFor={id} onClick={handleLabelOnClick}>
//             <span>{label}</span>
//             {labelTooltipText && <IconTooltip content={labelTooltipText} />}
//           </Label>
//         )}

//         {!noToolbar && (
//           <Toolbar
//             toolbarId={toolbarId}
//             limitedTextFormatting={limitedTextFormatting}
//             withCTAButton={withCTAButton}
//             isButtonsMenuVisible={isButtonsMenuVisible}
//             noImages={noImages}
//             noVideos={noVideos}
//             noAlign={noAlign}
//             setIsButtonsMenuVisible={setIsButtonsMenuVisible}
//             handleCustomLink={handleCustomLink}
//             handleNormalLink={handleNormalLink}
//           />
//         )}
//         <div ref={editorRef}>{children}</div>
//       </Container>
//     );
//   }
// );

// export default QuillEditor;
