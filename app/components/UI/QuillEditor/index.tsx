import React, { PureComponent } from 'react';
import { isFunction } from 'lodash-es';

// Quill editor & modules
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Image & video resize modules
import BlotFormatter, { ImageSpec, IframeVideoSpec, ResizeAction, AlignAction, DeleteAction } from 'quill-blot-formatter';
Quill.register('modules/blotFormatter', BlotFormatter);

// BEGIN allow image alignment styles
const FormatAttributesList = [
  'alt',
  'height',
  'width',
  'style',
];

const BaseImageFormat = Quill.import('formats/image');

class ImageFormat extends BaseImageFormat {
  static formats(domNode) {
    return FormatAttributesList.reduce((formats, attribute) => {
      if (domNode.hasAttribute(attribute)) {
        formats[attribute] = domNode.getAttribute(attribute);
      }
      return formats;
    }, {});
  }
  format(name, value) {
    if (FormatAttributesList.indexOf(name) > -1) {
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
ImageFormat.blotName = 'imageFormat';
ImageFormat.tagName = 'img';

Quill.register(ImageFormat, true);

const BaseVideoFormat = Quill.import('formats/video');

class VideoFormat extends BaseVideoFormat {
  static formats(domNode) {
    return FormatAttributesList.reduce((formats, attribute) => {
      if (domNode.hasAttribute(attribute)) {
        formats[attribute] = domNode.getAttribute(attribute);
      }
      return formats;
    }, {});
  }
  format(name, value) {
    if (FormatAttributesList.indexOf(name) > -1) {
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
VideoFormat.blotName = 'videoFormat';
VideoFormat.tagName = 'iframe';
Quill.register(VideoFormat, true);
// END allow image & video resizing styles
class CustomImageSpec extends ImageSpec {
  getActions() {
    return [ResizeAction, AlignAction, DeleteAction];
  }
}
class CustomIframeVideoSpec extends IframeVideoSpec {
  getActions() {
    return [ResizeAction, AlignAction, DeleteAction];
  }
}

// Localization
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// Styling
import styled from 'styled-components';
import { fontSizes, colors, quillEditedContent, media } from 'utils/styleUtils';

const Container: any = styled.div`
  background: #fff;

  .ql-snow.ql-toolbar button:hover .ql-stroke, .ql-snow .ql-toolbar button:hover .ql-stroke, .ql-snow.ql-toolbar button:focus .ql-stroke, .ql-snow .ql-toolbar button:focus .ql-stroke, .ql-snow.ql-toolbar button.ql-active .ql-stroke, .ql-snow .ql-toolbar button.ql-active .ql-stroke, .ql-snow.ql-toolbar .ql-picker-label:hover .ql-stroke, .ql-snow .ql-toolbar .ql-picker-label:hover .ql-stroke, .ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-stroke, .ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-stroke, .ql-snow.ql-toolbar .ql-picker-item:hover .ql-stroke, .ql-snow .ql-toolbar .ql-picker-item:hover .ql-stroke, .ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-stroke, .ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-stroke, .ql-snow.ql-toolbar button:hover .ql-stroke-miter, .ql-snow .ql-toolbar button:hover .ql-stroke-miter, .ql-snow.ql-toolbar button:focus .ql-stroke-miter, .ql-snow .ql-toolbar button:focus .ql-stroke-miter, .ql-snow.ql-toolbar button.ql-active .ql-stroke-miter, .ql-snow .ql-toolbar button.ql-active .ql-stroke-miter, .ql-snow.ql-toolbar .ql-picker-label:hover .ql-stroke-miter, .ql-snow .ql-toolbar .ql-picker-label:hover .ql-stroke-miter, .ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-stroke-miter, .ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-stroke-miter, .ql-snow.ql-toolbar .ql-picker-item:hover .ql-stroke-miter, .ql-snow .ql-toolbar .ql-picker-item:hover .ql-stroke-miter, .ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-stroke-miter, .ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-stroke-miter, .ql-picker-label:focus .ql-stroke, .ql-picker-item:focus .ql-stroke {
    stroke: ${(props: any) => props.inAdmin ? colors.clBlue : props.theme.colorMain};
  }

  .ql-snow.ql-toolbar button:hover .ql-fill, .ql-snow .ql-toolbar button:hover .ql-fill, .ql-snow.ql-toolbar button:focus .ql-fill, .ql-snow .ql-toolbar button:focus .ql-fill, .ql-snow.ql-toolbar button.ql-active .ql-fill, .ql-snow .ql-toolbar button.ql-active .ql-fill, .ql-snow.ql-toolbar .ql-picker-label:hover .ql-fill, .ql-snow .ql-toolbar .ql-picker-label:hover .ql-fill, .ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-fill, .ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-fill, .ql-snow.ql-toolbar .ql-picker-item:hover .ql-fill, .ql-snow .ql-toolbar .ql-picker-item:hover .ql-fill, .ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-fill, .ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-fill, .ql-snow.ql-toolbar button:hover .ql-stroke.ql-fill, .ql-snow .ql-toolbar button:hover .ql-stroke.ql-fill, .ql-snow.ql-toolbar button:focus .ql-stroke.ql-fill, .ql-snow .ql-toolbar button:focus .ql-stroke.ql-fill, .ql-snow.ql-toolbar button.ql-active .ql-stroke.ql-fill, .ql-snow .ql-toolbar button.ql-active .ql-stroke.ql-fill, .ql-snow.ql-toolbar .ql-picker-label:hover .ql-stroke.ql-fill, .ql-snow .ql-toolbar .ql-picker-label:hover .ql-stroke.ql-fill, .ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-stroke.ql-fill, .ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-stroke.ql-fill, .ql-snow.ql-toolbar .ql-picker-item:hover .ql-stroke.ql-fill, .ql-snow .ql-toolbar .ql-picker-item:hover .ql-stroke.ql-fill, .ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-stroke.ql-fill, .ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-stroke.ql-fill, .ql-snow.ql-toolbar .ql-picker-label:focus .ql-stroke.ql-fill, .ql-snow.ql-toolbar .ql-picker-item:focus .ql-stroke.ql-fill {
    fill:  ${(props: any) => props.inAdmin ? colors.clBlue : props.theme.colorMain};
  }

  .ql-snow.ql-toolbar button:hover, .ql-snow .ql-toolbar button:hover, .ql-snow.ql-toolbar button:focus, .ql-snow .ql-toolbar button:focus, .ql-snow.ql-toolbar button.ql-active, .ql-snow .ql-toolbar button.ql-active, .ql-snow.ql-toolbar .ql-picker-label:hover,  .ql-snow.ql-toolbar .ql-picker-label:focus, .ql-snow .ql-toolbar .ql-picker-label:hover, .ql-snow.ql-toolbar .ql-picker-label.ql-active, .ql-snow .ql-toolbar .ql-picker-label.ql-active,  .ql-snow .ql-toolbar .ql-picker-label:focus, .ql-snow.ql-toolbar .ql-picker-item:hover, .ql-snow .ql-toolbar .ql-picker-item:hover, .ql-snow.ql-toolbar .ql-picker-item.ql-selected, .ql-snow.ql-toolbar .ql-picker-item:focus, .ql-snow .ql-toolbar .ql-picker-item.ql-selected {
    color:  ${(props: any) => props.inAdmin ? colors.clBlue : props.theme.colorMain};
  }

  .ql-toolbar {
    background: white;
    box-shadow: inset 0 0 2px rgba(0,0,0,0.1);
    border-radius: ${(props: any) => props.theme.borderRadius} ${(props: any) => props.theme.borderRadius} 0 0;
    border-bottom: 0 !important;
  }

  .ql-snow .ql-tooltip[data-mode="link"]::before {
    content: ${(props: any) => `"${props.linkPrompt}"`};
  }

  .ql-snow .ql-tooltip[data-mode="video"]::before {
    content: ${(props: any) => `"${props.videoPrompt}"`};
  }

  .ql-snow .ql-tooltip::before {
    content: ${(props: any) => `"${props.visitPrompt}"`};
  }

  .ql-snow .ql-tooltip.ql-editing a.ql-action::after {
    content: ${(props: any) => `"${props.save}"`};
  }

  .ql-snow .ql-tooltip a.ql-action::after {
    content: ${(props: any) => `"${props.edit}"`};
  }

  .ql-snow .ql-tooltip a.ql-remove::before {
    content: ${(props: any) => `"${props.remove}"`};
  }

  &.error .ql-container.ql-snow {
    border-color: ${colors.clRedError};
  }

  &.focussed {
    &.error .ql-container.ql-snow {
      border-color: ${colors.clRedError};
    }

    .ql-container.ql-snow {
      border-color: #999;
    }
  }

  .ql-container {
    width: 100%;
    height: 100%;
    max-height: ${({ theme: { menuHeight } }) => `calc(80vh - ${menuHeight}px)`};
    font-size: ${fontSizes.base}px;
    line-height: 24px;
    font-weight: 400;
    border-radius: 0 0 ${(props: any) => props.theme.borderRadius} ${(props: any) => props.theme.borderRadius};
    border-color: #ccc;
    box-shadow: inset 0 0 2px rgba(0, 0, 0, 0.1);
    -webkit-appearance: none;
    overflow-y: auto;

    .ql-editor {
      min-height: 300px;
    }

    .ql-editor.ql-blank::before {
      color: #aaa;
      font-style: normal;
      opacity: 1;
    }

    .ql-align .ql-picker-label svg {
      top: -3px;
    }

    ${media.smallerThanMaxTablet`
      max-height: ${({ theme: { mobileMenuHeight } }) => `calc(80vh - ${mobileMenuHeight}px)`};
    `}

    ${quillEditedContent()};
  }
`;

// Typings
export interface InputProps {
  noImages?: boolean;
  noVideos?: boolean;
  noAlign?: boolean;
  limitedTextFormatting?: boolean;
  noToolbar?: boolean;
  id: string;
  inAdmin?: boolean;
  hasError?: boolean;
}
export interface QuillProps {
  onChange?: (string) => void;
  value?: string;
  className?: string;
  theme?: string;
  style?: React.CSSProperties;
  readOnly?: boolean;
  defaultValue?: string;
  placeholder?: string;
  tabIndex?: number;
  bounds?: string | HTMLElement;
  onFocus?: () => void;
  onBlur?: () => void;
  onKeyPress?: React.EventHandler<any>;
  onKeyDown?: React.EventHandler<any>;
  onKeyUp?: React.EventHandler<any>;
  children?: React.ReactElement<any>;
  setRef?: (arg: any) => void | undefined;
}

interface State {
  editorHtml: string;
  isFocused: boolean;
}

interface ModulesConfig {
  imageDrop?: boolean;
  toolbar?: any;
  blotFormatter?: any;
  keyboard: any;
}

export interface Props extends InputProps, QuillProps { }

// Quill override link handler
function handleLink(value) {
  if (value) {
    const range = (this.quill as Quill).getSelection();
    if (range && range.length !== 0) {
      const tooltip = (this.quill as any).theme.tooltip;
      tooltip.edit('link', 'https://');
    } else {
      (this.quill as Quill).format('link', false);
    }
  }
}

function handlerTab() {
  // do nothing
  return true;
}

function handlerRemoveTab() {
  // do nothing
  return true;
}

class QuillEditor extends PureComponent<Props & InjectedIntlProps, State> {
  toolbarId: string;
  modules: ModulesConfig;
  formats: string[];
  toolbar: JSX.Element | null;

  constructor(props) {
    super(props);
    this.state = {
      editorHtml: '',
      isFocused: false
    };
    this.toolbarId = `ql-editor-toolbar-${props.id}`;
    this.modules = this.getModuleConfig(props);
    this.formats = this.getFormats(props);
    this.toolbar = this.computeToolbar(props);
  }

  componentDidUpdate(prevProps) {
    if (this.props.noToolbar !== prevProps.noToolbar
    || this.props.noImages !== prevProps.noImages
    || this.props.noVideos !== prevProps.noVideos) {
      this.modules = this.getModuleConfig(this.props);
    }
    if (this.props.limitedTextFormatting !== prevProps.limitedTextFormatting
    || this.props.noAlign !== prevProps.noAlign
    || this.props.noImages !== prevProps.noImages
    || this.props.noVideos !== prevProps.noVideos) {
      this.modules = this.getModuleConfig(this.props);
    }
    if (this.props.noToolbar !== prevProps.noToolbar
    || this.props.noAlign !== prevProps.noAlign
    || this.props.noImages !== prevProps.noImages
    || this.props.noVideos !== prevProps.noVideos
    || this.props.limitedTextFormatting !== prevProps.limitedTextFormatting) {
      this.modules = this.getModuleConfig(this.props);
    }
  }

  getFormats({
    noAlign,
    noImages,
    noVideos,
    limitedTextFormatting,
  }) {
    const formats = ['bold', 'italic', 'link'];
    if (!noImages) { formats.push('image', 'imageFormat', 'height', 'width', 'style'); }
    if (!noVideos) { formats.push('video', 'videoFormat', 'height', 'width', 'style'); }
    if (!limitedTextFormatting) {
      formats.push('list');
      if (!noAlign) {
        formats.push('align');
      }
      formats.push('header');
    }
    return formats;
  }

  getModuleConfig(props) {
    const {
      noToolbar,
      noImages,
      noVideos,
    } = props;
    return {
      blotFormatter: (noImages && noVideos) ? false : {
        specs: [CustomImageSpec, CustomIframeVideoSpec],
      },
      keyboard: {
        // This will overwrite the default binding also named 'tab'
        bindings: {
          tab: {
            key: 9,
            handler: handlerTab
          },
          'remove tab': {
            key: 9,
            shiftKey: true,
            collapsed: true,
            prefix: /\t$/,
            handler: handlerRemoveTab
          }
        }
      },
      toolbar: noToolbar ? false : {
        container: `#${this.toolbarId}`,
        handlers: {
          link: handleLink,
        }
      },
    };
  }

  computeToolbar({
    noToolbar,
    noAlign,
    noImages,
    noVideos,
    limitedTextFormatting,
    intl: { formatMessage },
  }) {
    if (noToolbar) return null;
    return (
      <div id={this.toolbarId} >
        {!limitedTextFormatting &&
          <span className="ql-formats" role="button" onClick={this.trackClickDropdown()}>
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
              onClick={this.trackAdvanced('align', 'left')}
              aria-label={formatMessage(messages.alignLeft)}
            />
            <button
              className="ql-align"
              value="center"
              onClick={this.trackAdvanced('align', 'center')}
              aria-label={formatMessage(messages.alignCenter)}
            />
            <button
              className="ql-align"
              value="right"
              onClick={this.trackAdvanced('align', 'right')}
              aria-label={formatMessage(messages.alignRight)}
            />
          </span>
        }
        {!limitedTextFormatting &&
          <span className="ql-formats">
            <button
              className="ql-list"
              value="ordered"
              onClick={this.trackAdvanced('list', 'ordered')}
              aria-label={formatMessage(messages.orderedList)}
            />
            <button
              className="ql-list"
              value="bullet"
              onClick={this.trackAdvanced('list', 'bullet')}
              aria-label={formatMessage(messages.unorderedList)}
            />
          </span>
        }
        <span className="ql-formats">
          <button className="ql-bold" onClick={this.trackBasic('bold')} aria-label={formatMessage(messages.bold)} />
          <button className="ql-italic" onClick={this.trackBasic('italic')} aria-label={formatMessage(messages.italic)} />
          <button className="ql-link" onClick={this.trackBasic('link')} aria-label={formatMessage(messages.link)} />
        </span>

        {!(noImages && noVideos) &&
          <span className="ql-formats">
            {!noImages && <button className="ql-image" onClick={this.trackImage} aria-label={formatMessage(messages.image)} />}
            {!noVideos && <button className="ql-video" onClick={this.trackVideo} aria-label={formatMessage(messages.video)} />}
          </span>
        }
      </div>
    );
  }

  setRef = (element) => {
    if (isFunction(this.props.setRef)) {
      this.props.setRef(element);
    }
  }

  handleChange = (html) => {
    this.setState({ editorHtml: html });
  }

  trackAdvanced = (type, option) => {
    return () => {
      trackEventByName(tracks.advancedEditing.name, {
        extra: {
          type,
          option,
        },
      });
    };
  }

  trackClickDropdown = () => {
    return (e) => {
      if (e.target && e.target.classList.contains('ql-picker-item')) {
        const value = e.target.getAttribute('data-value');
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
  }

  trackBasic = (type) => {
    return () => trackEventByName(tracks.basicEditing.name, {
      extra: {
        type,
      },
    });
  }

  trackImage = () => {
    return trackEventByName(tracks.imageEditing.name);
  }

  trackVideo = () => {
    return trackEventByName(tracks.videoEditing.name);
  }

  handleOnFocus = () => {
    this.setState({ isFocused: true });
    this.props.onFocus && this.props.onFocus();
  }

  handleOnBlur = () => {
    this.setState({ isFocused: false });
    this.props.onBlur && this.props.onBlur();
  }

  render() {
    const {
      id,
      noToolbar,
      noAlign,
      noImages,
      noVideos,
      limitedTextFormatting,
      inAdmin,
      hasError,
      intl: { formatMessage },
      ...quillProps
    } = this.props;
    const { isFocused } = this.state;

    return (
      <Container
        id="boundaries"
        className={`${isFocused ? 'focussed' : 'blurred'} ${hasError ? 'error' : ''}`}
        inAdmin={inAdmin}
        videoPrompt={formatMessage(messages.videoPrompt)}
        linkPrompt={formatMessage(messages.linkPrompt)}
        visitPrompt={formatMessage(messages.visitPrompt)}
        save={formatMessage(messages.save)}
        edit={formatMessage(messages.edit)}
        remove={formatMessage(messages.remove)}
        onFocus={this.handleOnFocus}
        onBlur={this.handleOnBlur}
      >
        {this.toolbar}
        <ReactQuill
          modules={this.modules}
          bounds="#boundaries"
          theme="snow"
          formats={this.formats}
          ref={this.setRef}
          {...quillProps}
        />
      </Container >
    );
  }
}

export default injectIntl<Props>(QuillEditor);
