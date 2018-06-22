import React from 'react';

// Quill editor & modules
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { ImageDrop } from 'quill-image-drop-module';

// Localization
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

Quill.register('modules/imageDrop', ImageDrop);

interface Props {
  id: string;
}

interface State {
  editorHtml: string;
}

const change = e => e.persist();

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
    const { formatMessage } = this.props.intl;
    const { id } = this.props;
    const toolbarId = `ql-editor-toolbar-${id}`;
    return (
      <div className="text-editor">
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
        <button className="ql-video" />
      </div>
        <ReactQuill
          onChange={this.handleChange}
          value={this.state.editorHtml}
          modules={{
            imageDrop: true,
            toolbar: {
              container: `#${toolbarId}`,
            },
          }}
        />
      </div>
    );
  }
}

export default injectIntl<Props>(QuillEditor);
