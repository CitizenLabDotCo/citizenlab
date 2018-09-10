import React, { Component, createRef } from 'react';
import { getBase64FromFile, createObjectUrl } from 'utils/imageTools';
import { UploadFile } from 'typings';

// i18n
import messages from './messages';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';

// styling
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// components
import Icon from 'components/UI/Icon';

const Container = styled.div`
  margin-bottom: 10px;
`;

const StyledIcon = styled(Icon)`
  width: 24px;
  height: 18px;
  fill: ${colors.label};
  margin-right: 10px;
`;

const Input = styled.input`
   display: none;
 `;

const Label = styled.label`
  display: flex;
  max-width: 520px;
  align-items: center;
  cursor: pointer;
  border: 1.5px dashed ${colors.adminTextColor};
  border-radius: 5px;
  font-size: ${fontSizes.base}px;
  padding: 10px 20px;
  color: ${colors.label};

  &:hover {
    text-decoration: underline;
  }
`;

interface Props {
  onAdd: (file: UploadFile) => void;
}

class FileInput extends Component<InjectedIntlProps &Props> {
  private fileInput = createRef<HTMLInputElement>();

  onClick = (e) => {
    // reset the value of the input field
    // so we can upload the same file again after deleting it
    e.target.value = null;
  }

  onChange = () => {
    const current = this.fileInput.current;

    if (current && current.files && current.files.length > 0) {
      const file = current.files[0] as UploadFile;

      getBase64FromFile(file).then(res => {
        file.filename = file.name;
        file.base64 = res;
        file.url = createObjectUrl(file);
        this.props.onAdd(file);
      });
    }
  }

  render() {
    return (
      <Container>
        <Input
          id="project-attachment-uploader"
          onChange={this.onChange}
          onClick={this.onClick}
          type="file"
          multiple
          innerRef={this.fileInput}
          accept=".mobi, .pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx, .txt, .sxw, .sxc, .sxi, .sdw, .sdc, .sdd, .csv, .mp3, .mp4, .mkv, .avi"
        />
        <Label htmlFor="project-attachment-uploader">
          <StyledIcon name="upload-file" />
          <FormattedMessage {...messages.FileInputDescription} />
        </Label>
      </Container>
    );
  }
}

export default injectIntl<Props>(FileInput);
