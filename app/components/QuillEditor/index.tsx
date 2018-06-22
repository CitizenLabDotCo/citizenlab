import React from 'react';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Image drop/copy-paste module
import { ImageDrop } from 'quill-image-drop-module';
Quill.register('modules/imageDrop', ImageDrop);

// Typings
interface Props {
  noToolbar?: boolean;
  noMentions?: boolean;
  noImages?: boolean;
}
interface State {
  editorHtml: string;
}

interface ModulesConfig {
  imageDrop?: boolean;
  toolbar?: boolean | string[] | string[][];
}

const completeToolbarConfig = [
  ['bold', 'italic'],
  ['link', 'image', 'video'],
];

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
    const { noToolbar } = this.props;
    const modules: ModulesConfig = {
      imageDrop: true,
      toolbar: noToolbar ? false : completeToolbarConfig,
    };

    return (
      <div>
        <ReactQuill
          onChange={this.handleChange}
          value={this.state.editorHtml}
          modules={modules}
        />
      </div>
    );
  }
}
