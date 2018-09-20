import React from 'react';
import styled from 'styled-components';
import FileDisplay from 'components/UI/FileDisplay';
import { UploadFile } from 'typings';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

const Header = styled.h3``;

interface Props {
  files: UploadFile[];
}

const FileAttachments = ({ files }: Props & InjectedIntlProps) => {
  return (
    <>
      <Header>
        <FormattedMessage {...messages.attachmentsHeader} />
      </Header>
      {Array.isArray(files) && files.map(file => (
        <FileDisplay
          key={file.id}
          file={file}
        />
      ))}
    </>
  );
};

const FileAttachmentsWithIntl = injectIntl<Props & InjectedIntlProps>(FileAttachments);

export default FileAttachmentsWithIntl;
