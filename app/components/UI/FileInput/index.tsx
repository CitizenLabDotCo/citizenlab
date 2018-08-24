import React, { Component, createRef } from 'react';
import { getBase64FromFile } from 'utils/imageTools';
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
  display: flex
  align-items: center;
  cursor: pointer;
  border: 1px dashed ${colors.adminTextColor};
  border-radius: 5px;
  font-size: ${fontSizes.base}px;
  padding: 10px 20px
  color: ${colors.label};

  &:hover {
    border: 1px solid ${colors.adminTextColor};
  }
`;

interface Props {
  onAdd: (file: UploadFile) => void;
}

class FileInput extends Component<InjectedIntlProps &Props> {
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
      <Container>
        <Input
          id="project-attachment-uploader"
          onChange={this.onChange}
          type="file"
          multiple
          innerRef={this.fileInput}
          accept=".pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx, .txt, .sxw, .sxc, .sxi, .sdw, .sdc, .sdd, .csv, .mp3, .mp4, .mkv, .avi"
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
