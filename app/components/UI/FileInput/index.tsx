import React, { Component, createRef } from 'react';
import { getBase64FromFile } from 'utils/imageTools';
import { UploadFile } from 'typings';

interface Props {
  onAdd: (file: UploadFile) => void;
}

class FileInput extends Component<Props> {
  private fileInput = createRef<HTMLInputElement>();

  onChange = () => {
    const current = this.fileInput.current;
    if (current && current.files && current.files.length > 0) {
      const file: UploadFile = current.files[0];
      getBase64FromFile(file).then(res => {
        file.base64 = res;
        this.props.onAdd(file);
      });
    }
  }

  render() {
    return (
      <input
        onChange={this.onChange}
        type="file"
        multiple
        ref={this.fileInput}
        accept=".pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx, .txt, .sxw, .sxc, .sxi, .sdw, .sdc, .sdd, .csv, .mp3, .mp4, .mkv, .avi"
      />
    );
  }
}

export default FileInput;
