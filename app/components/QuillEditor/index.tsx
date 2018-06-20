import React from 'react';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { ImageDrop } from 'quill-image-drop-module';

Quill.register('modules/imageDrop', ImageDrop);

interface Props {}
interface State {
  editorHtml: string;
}

export default class QuillEditor extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = { editorHtml: '' };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(html) {
    this.setState({ editorHtml: html });
  }

  render() {
    return (
      <div>
        <ReactQuill
          onChange={this.handleChange}
          value={this.state.editorHtml}
          modules={{ imageDrop: true }}
        />
      </div>
    );
  }
}
