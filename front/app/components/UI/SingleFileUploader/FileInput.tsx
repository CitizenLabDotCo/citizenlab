import React, { FormEvent, ChangeEvent } from 'react';
import { getBase64FromFile } from 'utils/fileUtils';
import { UploadFile } from 'typings';

// i18n
import messages from 'components/UI/FileUploader/messages';
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

interface Props {
  onAdd: (file: UploadFile) => void;
  className?: string;
  id: string;
}

const SingleFileInput = ({ className, id, onAdd }: Props) => {
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

export default SingleFileInput;
