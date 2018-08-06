import React from 'react';

// Quill editor & modules
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Image & video resize modules
import BlotFormatter from 'quill-blot-formatter';
Quill.register('modules/blotFormatter', BlotFormatter);

// BEGIN allow image alignment styles
const ImageFormatAttributesList = [
  'alt',
  'height',
  'width',
  'style',
];

const BaseImageFormat = Quill.import('formats/image');
class ImageFormat extends BaseImageFormat {
  static formats(domNode) {
    return ImageFormatAttributesList.reduce((formats, attribute) => {
      if (domNode.hasAttribute(attribute)) {
        formats[attribute] = domNode.getAttribute(attribute);
      }
      return formats;
    }, {});
  }
  format(name, value) {
    if (ImageFormatAttributesList.indexOf(name) > -1) {
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

Quill.register(ImageFormat, true);
// END allow image alignment styles

// Localization
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// tracking
import { injectTracks } from 'utils/analytics';
import tracks from './tracks';

// Styling
import styled from 'styled-components';
import { fontSize, colors } from 'utils/styleUtils';

const Container: any = styled.div`
  .ql-snow.ql-toolbar button:hover .ql-stroke, .ql-snow .ql-toolbar button:hover .ql-stroke, .ql-snow.ql-toolbar button:focus .ql-stroke, .ql-snow .ql-toolbar button:focus .ql-stroke, .ql-snow.ql-toolbar button.ql-active .ql-stroke, .ql-snow .ql-toolbar button.ql-active .ql-stroke, .ql-snow.ql-toolbar .ql-picker-label:hover .ql-stroke, .ql-snow .ql-toolbar .ql-picker-label:hover .ql-stroke, .ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-stroke, .ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-stroke, .ql-snow.ql-toolbar .ql-picker-item:hover .ql-stroke, .ql-snow .ql-toolbar .ql-picker-item:hover .ql-stroke, .ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-stroke, .ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-stroke, .ql-snow.ql-toolbar button:hover .ql-stroke-miter, .ql-snow .ql-toolbar button:hover .ql-stroke-miter, .ql-snow.ql-toolbar button:focus .ql-stroke-miter, .ql-snow .ql-toolbar button:focus .ql-stroke-miter, .ql-snow.ql-toolbar button.ql-active .ql-stroke-miter, .ql-snow .ql-toolbar button.ql-active .ql-stroke-miter, .ql-snow.ql-toolbar .ql-picker-label:hover .ql-stroke-miter, .ql-snow .ql-toolbar .ql-picker-label:hover .ql-stroke-miter, .ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-stroke-miter, .ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-stroke-miter, .ql-snow.ql-toolbar .ql-picker-item:hover .ql-stroke-miter, .ql-snow .ql-toolbar .ql-picker-item:hover .ql-stroke-miter, .ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-stroke-miter, .ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-stroke-miter, .ql-picker-label:focus .ql-stroke, .ql-picker-item:focus .ql-stroke {
    stroke: ${(props: any) => props.inAdmin ? colors.clBlue : props.theme.colorMain};
  }
  .ql-snow.ql-toolbar button:hover .ql-fill, .ql-snow .ql-toolbar button:hover .ql-fill, .ql-snow.ql-toolbar button:focus .ql-fill, .ql-snow .ql-toolbar button:focus .ql-fill, .ql-snow.ql-toolbar button.ql-active .ql-fill, .ql-snow .ql-toolbar button.ql-active .ql-fill, .ql-snow.ql-toolbar .ql-picker-label:hover .ql-fill, .ql-snow .ql-toolbar .ql-picker-label:hover .ql-fill, .ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-fill, .ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-fill, .ql-snow.ql-toolbar .ql-picker-item:hover .ql-fill, .ql-snow .ql-toolbar .ql-picker-item:hover .ql-fill, .ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-fill, .ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-fill, .ql-snow.ql-toolbar button:hover .ql-stroke.ql-fill, .ql-snow .ql-toolbar button:hover .ql-stroke.ql-fill, .ql-snow.ql-toolbar button:focus .ql-stroke.ql-fill, .ql-snow .ql-toolbar button:focus .ql-stroke.ql-fill, .ql-snow.ql-toolbar button.ql-active .ql-stroke.ql-fill, .ql-snow .ql-toolbar button.ql-active .ql-stroke.ql-fill, .ql-snow.ql-toolbar .ql-picker-label:hover .ql-stroke.ql-fill, .ql-snow .ql-toolbar .ql-picker-label:hover .ql-stroke.ql-fill, .ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-stroke.ql-fill, .ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-stroke.ql-fill, .ql-snow.ql-toolbar .ql-picker-item:hover .ql-stroke.ql-fill, .ql-snow .ql-toolbar .ql-picker-item:hover .ql-stroke.ql-fill, .ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-stroke.ql-fill, .ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-stroke.ql-fill, .ql-snow.ql-toolbar .ql-picker-label:focus .ql-stroke.ql-fill, .ql-snow.ql-toolbar .ql-picker-item:focus .ql-stroke.ql-fill {
    fill:  ${(props: any) => props.inAdmin ? colors.clBlue : props.theme.colorMain};
  }
  .ql-snow.ql-toolbar button:hover, .ql-snow .ql-toolbar button:hover, .ql-snow.ql-toolbar button:focus, .ql-snow .ql-toolbar button:focus, .ql-snow.ql-toolbar button.ql-active, .ql-snow .ql-toolbar button.ql-active, .ql-snow.ql-toolbar .ql-picker-label:hover,  .ql-snow.ql-toolbar .ql-picker-label:focus, .ql-snow .ql-toolbar .ql-picker-label:hover, .ql-snow.ql-toolbar .ql-picker-label.ql-active, .ql-snow .ql-toolbar .ql-picker-label.ql-active,  .ql-snow .ql-toolbar .ql-picker-label:focus, .ql-snow.ql-toolbar .ql-picker-item:hover, .ql-snow .ql-toolbar .ql-picker-item:hover, .ql-snow.ql-toolbar .ql-picker-item.ql-selected, .ql-snow.ql-toolbar .ql-picker-item:focus, .ql-snow .ql-toolbar .ql-picker-item.ql-selected {
    color:  ${(props: any) => props.inAdmin ? colors.clBlue : props.theme.colorMain};
  }
  .ql-toolbar.ql-snow {
    font-family: 'visuelt','Helvetica Neue',Helvetica,Arial,sans-serifhtml, body;
  }

  background: #fff;
  .ql-toolbar {
    background: white;
    box-shadow: inset 0 0 2px rgba(0,0,0,0.1);
    border-radius: 5px 5px 0 0;
    border-bottom: 0 !important;
    & *:focus {
      outline: none;
    }
  }
  .ql-container {
    font-family: 'visuelt','Helvetica Neue',Helvetica,Arial,sans-serifhtml, body;
    border-radius: 0 0 5px 5px;
    width: 100%;
    height: 100%;
    font-size: ${fontSize('base')};
    line-height: 24px;
    font-weight: 400;
    border-color: ${(props: any) => props.error ? props.theme.colors.clRedError : '#ccc'};
    box-shadow: inset 0 0 2px rgba(0, 0, 0, 0.1);
    -webkit-appearance: none;
    .ql-editor {
      min-height: 300px;
    }
    .ql-editor.ql-blank::before {
      color: #aaa;
      font-style: normal;
      opacity: 1;
    }

    &:focus {
      border-color: ${(props: any) => props.error ? props.theme.colors.clRedError : '#999'};
    }

    .ql-align .ql-picker-label svg {
      top: -3px;
    }
  }
`;

// Typings
export interface InputProps {
  noImages?: boolean;
  limitedTextFormatting?: boolean;
  noToolbar?: boolean;
  id: string;
  inAdmin?: boolean;
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
}

interface State {
  editorHtml: string;
}

interface ModulesConfig {
  imageDrop?: boolean;
  toolbar?: any;
  blotFormatter?: any;
}

interface Tracks {
  trackImageEditing: Function;
  trackBasicEditing: Function;
  trackVideoEditing: Function;
  trackAdvancedEditing: Function;
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

class QuillEditor extends React.Component<Props & InjectedIntlProps & Tracks, State> {
  constructor(props) {
    super(props);
    this.state = { editorHtml: '' };
  }

  handleChange = html => this.setState({ editorHtml: html });

  // Begin event tracking functions
  trackAdvanced = (type, option) => {
    return () => {
      this.props.trackAdvancedEditing({
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
        this.props.trackAdvancedEditing({
          extra: {
            option,
            type: 'heading',
          },
        });
      }
    };
  }
  trackBasic = (type) => {
    return () => this.props.trackBasicEditing({
      extra: {
        type,
      },
    });
  }
  trackImage = () => {
    return this.props.trackImageEditing();
  }
  trackVideo = () => {
    return this.props.trackVideoEditing();
  }
  // End event tracking functions

  render() {
    const {
      id,
      noToolbar,
      noImages,
      limitedTextFormatting,
      inAdmin,
      trackBasicEditing,
      trackImageEditing,
      trackVideoEditing,
      trackAdvancedEditing,
      intl: { formatMessage },
      ...quillProps
    } = this.props;

    const toolbarId = `ql-editor-toolbar-${id}`;

    const modules: ModulesConfig = {
      blotFormatter: noImages ? false : {},
      toolbar: noToolbar ? false : {
        container: `#${toolbarId}`,
        handlers: {
          link: handleLink,
        }
      },
    };

    return (
      <Container id="boundaries" inAdmin={inAdmin}>
        <div id={toolbarId} >
          {!limitedTextFormatting &&
            <span className="ql-formats" role="button" onClick={this.trackClickDropdown()}>
              <select className="ql-header" defaultValue={''}>
                <option
                  value="1"
                  aria-selected={false}
                >{formatMessage(messages.title)}
                </option>
                <option
                  value="2"
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
          {!limitedTextFormatting &&
            <span className="ql-formats">
              <button
                className="ql-align"
                value=""
                onClick={this.trackAdvanced('align', 'left')}
              />
              <button
                className="ql-align"
                value="center"
                onClick={this.trackAdvanced('align', 'center')}
              />
              <button
                className="ql-align"
                value="right"
                onClick={this.trackAdvanced('align', 'right')}
              />
            </span>
          }
          {!limitedTextFormatting &&
            <span className="ql-formats">
              <button className="ql-list" value="ordered" onClick={this.trackAdvanced('list', 'ordered')} />
              <button className="ql-list" value="bullet" onClick={this.trackAdvanced('list', 'bullet')} />
            </span>
          }
          <span className="ql-formats">
            <button className="ql-bold" onClick={this.trackBasic('bold')} />
            <button className="ql-italic" onClick={this.trackBasic('italic')} />
            <button className="ql-link" onClick={this.trackBasic('link')} />
          </span>

          {!noImages &&
            <span className="ql-formats">
              <button className="ql-image" onClick={this.trackImage} />
              <button className="ql-video" onClick={this.trackVideo} />
            </span>
          }
        </div>
        <ReactQuill
          modules={modules}
          bounds="#boundaries"
          theme="snow"
          {...quillProps}
        />
      </Container>
    );
  }
}

const QuillEditorWithHoc = injectTracks<Props>({
  trackBasicEditing: tracks.basicEditing,
  trackImageEditing: tracks.imageEditing,
  trackVideoEditing: tracks.videoEditing,
  trackAdvancedEditing: tracks.advancedEditing,
})(QuillEditor);
export default injectIntl<Props>(QuillEditorWithHoc);
