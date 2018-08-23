import React, { Component, createRef } from 'react';
import { getBase64FromFile } from 'utils/imageTools';
import { UploadFile } from 'typings';

// styling
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

const Input = styled.input`
  display: none;
`;

const Label = styled.label`
  display: block;
  cursor: pointer;
  color: ${colors.label};
  border: 1px dashed ${colors.adminTextColor};
  border-radius: 5px;
  font-size: ${fontSizes.base}px;
  padding: 10px 20px;
`;

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
      <>
        <Input
          id="project-attachment-uploader"
          onChange={this.onChange}
          type="file"
          multiple
          innerRef={this.fileInput}
          accept=".pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx, .txt, .sxw, .sxc, .sxi, .sdw, .sdc, .sdd, .csv, .mp3, .mp4, .mkv, .avi"
        />
        <Label htmlFor="project-attachment-uploader">Browse files</Label>
      </>
    );
  }
}

export default FileInput;
