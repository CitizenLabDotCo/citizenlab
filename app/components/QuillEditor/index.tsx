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
interface Props {
  noToolbar?: boolean;
  noMentions?: boolean;
  noImages?: boolean;
  id: string;
}

interface State {
  editorHtml: string;
}

interface ModulesConfig {
  imageDrop?: boolean;
  toolbar?: any;
}

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
    const { id, noToolbar, intl: { formatMessage } } = this.props;

    const toolbarId = `ql-editor-toolbar-${id}`;

    const modules: ModulesConfig = {
      imageDrop: true,
      toolbar: noToolbar ? false : {
        container: `#${toolbarId}`,
      },
    };

    return (
      <>
        <div id={toolbarId} >
          <select className="ql-header" defaultValue={''} onChange={change} >
            <option value="1" aria-selected={false}>{formatMessage(messages.bigTitle)}</option>
            <option value="2" aria-selected={false}>{formatMessage(messages.littleTitle)}</option>
            <option value="" aria-selected>{formatMessage(messages.normalText)}</option>
          </select>
          <button className="ql-bold" />
          <button className="ql-italic" />
          <button className="ql-link" />
          <button className="ql-image" />
          <button className="ql-imageURL" >URL</button>
          <button className="ql-video" />
        </div>
        <ReactQuill
          onChange={this.handleChange}
          value={this.state.editorHtml}
          modules={modules}
        />
      </>
    );
  }
}

export default injectIntl<Props>(QuillEditor);
