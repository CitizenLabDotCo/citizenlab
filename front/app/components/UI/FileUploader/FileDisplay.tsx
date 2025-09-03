import React from 'react';

import {
  colors,
  fontSizes,
  media,
  Icon,
  IconButton,
} from '@citizenlab/cl2-component-library';
import { lighten } from 'polished';
import styled from 'styled-components';

import { ScreenReaderOnly } from 'utils/a11y';
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { returnFileSize } from 'utils/fileUtils';

import messages from './messages';

const Container = styled.div<{ error: boolean }>`
  display: flex;
  align-items: center;
  padding: 10px 20px;
  margin-bottom: 10px;
  margin-top: 10px;
  border-radius: ${(props) => props.theme.borderRadius};
  border: 1px solid
    ${({ error }) =>
      error ? lighten(0.4, colors.error) : lighten(0.4, colors.textSecondary)};
`;

const Paperclip = styled(Icon)`
  flex: 0 0 24px;
  fill: ${colors.textSecondary};
  margin-right: 15px;
`;

const FileInfo = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const FileDownloadLink = styled.a<{ error: boolean }>`
  color: ${({ error }) => (error ? colors.error : colors.textSecondary)};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  line-height: normal;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-all;
  word-break: break-word;
  hyphens: auto;

  &:hover {
    color: inherit;
    text-decoration: underline;
  }
`;

const FileSize = styled.span<{ error: boolean }>`
  color: ${({ error }) => (error ? colors.error : colors.textSecondary)};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  line-height: normal;
  white-space: nowrap;
  margin-left: 10px;

  ${media.phone`
    display: none;
  `}
`;

const DeleteIconButton = styled(IconButton)``;

export interface FileType {
  id?: string;
  url?: string;
  remote?: boolean;
  base64?: string;
  name: string;
  size: number;
  error?: string[];
  ordering?: number;
}

interface Props {
  file: FileType;
  onDeleteClick: (event: React.MouseEvent) => void;
}

const FileDisplay = ({ file, onDeleteClick }: Props) => {
  const { url, size, name: filename, error } = file;
  const { formatMessage } = useIntl();

  return (
    <Container error={!!error}>
      <Paperclip name="paperclip" ariaHidden />
      <FileInfo>
        <FileDownloadLink
          error={!!error}
          href={url}
          download={filename}
          target="_blank"
          rel="noopener noreferrer"
        >
          {error ? (
            <FormattedMessage
              {...messages[error[0]]}
              values={{ fileName: filename }}
            />
          ) : (
            <>
              <ScreenReaderOnly>
                <FormattedMessage {...messages.a11y_file} />
              </ScreenReaderOnly>
              {filename}
            </>
          )}
        </FileDownloadLink>
        {size && <FileSize error={!!error}>({returnFileSize(size)})</FileSize>}
      </FileInfo>
      <DeleteIconButton
        buttonType="button"
        iconName="delete"
        a11y_buttonActionMessage={formatMessage(messages.a11y_removeFile)}
        onClick={onDeleteClick}
        iconColor={colors.textSecondary}
        iconColorOnHover={colors.error}
      />
    </Container>
  );
};

export default FileDisplay;
