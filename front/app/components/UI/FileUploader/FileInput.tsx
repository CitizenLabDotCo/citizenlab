import React, { FormEvent, ChangeEvent } from 'react';
import { getBase64FromFile } from 'utils/fileUtils';
import { UploadFile } from 'typings';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// styling
import styled from 'styled-components';
import { colors, fontSizes, defaultOutline, isRtl } from 'utils/styleUtils';

// components
import { Icon } from '@citizenlab/cl2-component-library';

const Container = styled.div`
  margin-bottom: 10px;
  position: relative;
`;

const StyledIcon = styled(Icon)`
  fill: ${colors.textSecondary};
  margin-right: 10px;

  ${isRtl`
    margin-right: 0;
    margin-left: 10px;
  `}
`;

const Input = styled.input`
  opacity: 0;
  width: 1px;
  height: 1px;
  position: absolute;
  &:focus + label {
    color: #000;
    border-color: #000;
    ${defaultOutline};

    ${StyledIcon} {
      fill: #000;
    }
  }
`;

const Label = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  border: 1px dashed ${colors.borderDark};
  border-radius: ${(props) => props.theme.borderRadius};
  font-size: ${fontSizes.base}px;
  padding: 10px 20px;
  color: ${colors.textSecondary};
  background: transparent;
  font-weight: 400;

  ${isRtl`
    flex-direction: row-reverse;
  `}

  &:hover {
    color: #000;
    border-color: #000;

    ${StyledIcon} {
      fill: #000;
    }
  }
`;

// accepted file extensions:
const fileAccept = [
  '.pdf',
  'application/pdf',

  '.doc',
  'application/doc',
  'application/ms-doc',
  'application/msword',

  '.docx',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',

  '.odt',
  'application/vnd.oasis.opendocument.text',

  '.xls',
  'application/excel',
  'application/vnd.ms-excel',
  'application/x-excel',
  'application/x-msexcel',

  '.xlsx',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',

  '.ods',
  'application/vnd.oasis.opendocument.spreadsheet',

  '.ppt',
  'application/mspowerpoint',
  'application/powerpoint',
  'application/vnd.ms-powerpoint',
  'application/x-mspowerpoint',

  '.pptx',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',

  '.odp',
  'application/vnd.oasis.opendocument.presentation',

  '.txt',
  'text/plain',

  '.csv',
  'text/csv',

  '.mp3',
  'audio/mpeg',
  'audio/mpeg3',
  'audio/x-mpeg-3',

  '.mp4',
  'video/mp4',

  '.avi',
  'video/avi',
  'video/msvideo',
  'video/x-msvideo',

  '.mkv',
  'video/x-matroska',
];

interface Props {
  onAdd: (file: UploadFile) => void;
  className?: string;
  id: string;
}

const FileInput = ({ className, id, onAdd }: Props) => {
  const onClick = (event: FormEvent<any>) => {
    // reset the value of the input field
    // so we can upload the same file again after deleting it
    event.currentTarget.value = null;
  };

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;

    if (files && files.length > 0) {
      Array.from(files).forEach(async (file: UploadFile) => {
        const base64 = await getBase64FromFile(file);
        file.base64 = base64;
        file.filename = file.name;
        file.extension =
          file.type ||
          base64.substring(base64.indexOf(':') + 1, base64.indexOf(';base64'));
        if (!fileAccept.includes(file.extension)) {
          file.error = ['incorrect_extension'];
        }
        file.remote = false;
        onAdd(file);
      });
    }
  };

  return (
    <Container className={className}>
      <Input
        id={id}
        onChange={onChange}
        onClick={onClick}
        type="file"
        accept={fileAccept.join(',')}
        tabIndex={0}
        data-testid="fileInput"
      />
      <Label aria-hidden htmlFor={id}>
        <StyledIcon name="upload-file" ariaHidden />
        <FormattedMessage {...messages.fileInputDescription} />
      </Label>
    </Container>
  );
};

export default FileInput;
