import React from 'react';

// Quill editor & modules
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Image drop/copy-paste module
import { ImageDrop } from 'quill-image-drop-module';
Quill.register('modules/imageDrop', ImageDrop);

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

// Styling
import styled from 'styled-components';
import { fontSize, colors, media } from 'utils/styleUtils';

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
  .ql-toolbar.ql-snow {
    font-family: 'visuelt','Helvetica Neue',Helvetica,Arial,sans-serifhtml, body;
  }
  .ql-toolbar {
    background: white;
    z-index: 5;
    box-shadow: inset 0 0 2px rgba(0,0,0,0.1);
    border-radius: 5px 5px 0 0;
    border-bottom: 0 !important;
    & *:focus {
      outline: none;
    }
    position: sticky;
    top: 0px;
    ${media.biggerThanMaxTablet`
      top:74px;
    `}
  }
  .ql-container {
    font-family: 'visuelt','Helvetica Neue',Helvetica,Arial,sans-serifhtml, body;
    border-radius: 0 0 5px 5px;
    width: 100%;
    height: 100%;
    font-size: ${fontSize('base')};
    line-height: 24px;
    font-weight: 400;
    border-color: ${(props: any) => props.error ? props.theme.colors.error : '#ccc'};
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
      border-color: ${(props: any) => props.error ? props.theme.colors.error : '#999'};
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
export interface Props extends InputProps, QuillProps { }

const change = e => e.persist();

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

class QuillEditor extends React.Component<Props & InjectedIntlProps, State> {
  constructor(props) {
    super(props);
    this.state = { editorHtml: '' };
  }

  handleChange = (html) => {
    this.setState({ editorHtml: html });
  }

  render() {
    const { id, noToolbar, noImages, limitedTextFormatting, inAdmin, intl: { formatMessage }, ...quillProps } = this.props;

    const toolbarId = `ql-editor-toolbar-${id}`;

    const modules: ModulesConfig = {
      imageDrop: !noImages,
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
            <>
              <span className="ql-formats">
                <select className="ql-header" defaultValue={''} onChange={change} >
                  <option value="1" aria-selected={false}>{formatMessage(messages.title)}</option>
                  <option value="2" aria-selected={false}>{formatMessage(messages.subtitle)}</option>
                  <option value="" aria-selected>{formatMessage(messages.normalText)}</option>
                </select>
              </span>
              <span className="ql-formats">
                <button className="ql-align" value="" />
                <button className="ql-align" value="center" />
                <button className="ql-align" value="right" />
              </span>
              <span className="ql-formats">
                <button className="ql-list" value="ordered" />
                <button className="ql-list" value="bullet" />
              </span>
            </>
          }
          <span className="ql-formats">
            <button className="ql-bold" />
            <button className="ql-italic" />
            <button className="ql-link" />
          </span>

          {!noImages &&
            <span className="ql-formats">
              <button className="ql-image" />
              <button className="ql-video" />
            </span>
          }
        </div>
        <div id="scrollingContainer">
          <ReactQuill
            modules={modules}
            bounds="#boundaries"
            theme="snow"
            {...quillProps}
          />
        </div>
      </Container>
    );
  }
}
export default injectIntl<Props>(QuillEditor);
