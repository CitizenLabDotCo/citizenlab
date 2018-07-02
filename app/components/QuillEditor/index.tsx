import React from 'react';

// Quill editor & modules
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Image drop/copy-paste module
import { ImageDrop } from 'quill-image-drop-module';
Quill.register('modules/imageDrop', ImageDrop);

// Localization
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// Typings
export interface InputProps {
  noToolbar?: boolean;
  noMentions?: boolean;
  noImages?: boolean;
  id: string;
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
}
export interface Props extends InputProps, QuillProps { }

const change = e => e.persist();

function imageHandler() {
  const range = this.quill.getSelection();
  const value = prompt('What is the image URL');
  this.quill.insertEmbed(range.index, 'image', value, 'user');
}

class QuillEditor extends React.Component<Props & InjectedIntlProps, State> {
  constructor(props) {
    super(props);
    this.state = { editorHtml: '' };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(html) {
    this.setState({ editorHtml: html });
  }

  render() {
    const { id, noToolbar, noImages, intl: { formatMessage }, ...quillProps } = this.props;

    const toolbarId = `ql-editor-toolbar-${id}`;

    const modules: ModulesConfig = {
      imageDrop: true,
      toolbar: noToolbar ? false : {
        container: `#${toolbarId}`,
        handlers: noImages ? false : {
          imageURL: imageHandler,
        }
      },
    };

    return (
      <>
        <div id={toolbarId} >
          <span className="ql-formats">
            <select className="ql-header" defaultValue={''} onChange={change} >
              <option value="1" aria-selected={false}>{formatMessage(messages.bigTitle)}</option>
              <option value="2" aria-selected={false}>{formatMessage(messages.littleTitle)}</option>
              <option value="" aria-selected>{formatMessage(messages.normalText)}</option>
            </select>
          </span>
          <span className="ql-formats">
            <button className="ql-bold" />
            <button className="ql-italic" />
            <button className="ql-link" />
          </span>
          <span className="ql-formats">
            <select className="ql-align" defaultValue={'0'} onChange={change}>
                <option value="" aria-selected/>
                <option value="center" aria-selected/>
                <option value="right" aria-selected/>
            </select>
          </span>

          {!noImages &&
            <span className="ql-formats">
              <button className="ql-image" />
              <button className="ql-imageURL" >URL</button>
              <button className="ql-video" />
            </span>
          }
        </div>
        <ReactQuill
          modules={modules}
          {...quillProps}
        />
      </>
    );
  }
}

export default injectIntl<Props>(QuillEditor);
