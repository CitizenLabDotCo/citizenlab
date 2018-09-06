import React from 'react';
import { returnFileSize } from 'utils/helperUtils';

// styles
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// components
import Icon  from 'components/UI/Icon';
import { isError } from 'util';
import { UploadFile } from 'typings';

const Container = styled.div`
  display: flex;
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
  color: ${colors.label};
  display: inline-block;
  margin-right: 5px;
  text-decoration: underline;
`;

const FileSize = styled.span`
  margin-right: auto;
`;

const DeleteButton = styled.button`
  display: flex;
  align-items: center;
  cursor: pointer;

  &:hover {
    .cl-icon {
      fill: ${colors.clRed};
    }
  }
`;

const StyledIcon = styled(Icon)`
  width: 12px;
  fill: ${colors.label};
`;

interface Props {
  file: UploadFile;
  onDeleteClick?: () => void;
}

const FileDisplay = ({ file, onDeleteClick }: Props) => {
  if (file && !isError(file)) {
    return (
      <Container>
        <Paperclip name="paperclip" />
        <FileDownloadLink href={file.url} download target="blank">
          {file.filename}
        </FileDownloadLink>
        <FileSize>({returnFileSize(file.size)})</FileSize>
        {onDeleteClick &&
        <DeleteButton onClick={onDeleteClick}>
          <StyledIcon name="delete" />
        </DeleteButton>
        }
      </Container>
    );
  }

  return null;
};

export default FileDisplay;
