import React from 'react';
import { UploadFile } from 'typings';
import { returnFileSize } from 'utils/helperUtils';

// styles
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// components
import Icon, { Props as IconProps } from 'components/UI/Icon';

const Container = styled.div`
  display: flex
  align-items: center;
  color: ${colors.label};
  border: 1px solid ${colors.label};
  border-radius: 5px;
  font-size: ${fontSizes.base}px;
  line-height: 24px;
  padding: 10px 20px;
  margin-bottom: 10px;
`;

const Paperclip = styled(Icon)`
  width: 10px;
  height: 20px;
  fill: ${colors.label};
  margin-right: 10px;
`;

const FileDownloadLink = styled.a`
  color: ${colors.label}
  display: inline-block;
  margin-right: 5px;
  text-decoration: underline;
`;

const FileSize = styled.span`
  margin-right: auto;
`;

const DeleteIcon = styled<IconProps>(Icon)`
  width: 12px;
  height: 14px;
  fill: ${colors.label};
  cursor: pointer;
`;

interface Props {
  file: UploadFile;
  onDeleteClick: () => void;
}

const FileDisplay = ({ file, onDeleteClick }: Props) => {
  return (
    <Container>
      <Paperclip name="paperclip" />
      <FileDownloadLink href={file.objectUrl || file.base64} download={file.name} target="blank">
        {file.name}
      </FileDownloadLink>
      <FileSize>({returnFileSize(file.size)})</FileSize>
      <DeleteIcon name="delete" onClick={onDeleteClick} />
    </Container>
  );
};

export default FileDisplay;
