import React from 'react';
import { returnFileSize } from 'utils/fileUtils';
import { lighten } from 'polished';

// styles
import styled from 'styled-components';
import { colors, fontSizes, media } from 'utils/styleUtils';
import { ScreenReaderOnly } from 'utils/a11y';

// components
import { Icon } from '@citizenlab/cl2-component-library';
import { UploadFile } from 'typings';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

const Container = styled.div<{ error: boolean }>`
  display: flex;
  align-items: center;
  padding: 10px 20px;
  margin-bottom: 10px;
  margin-top: 10px;
  border-radius: ${(props: any) => props.theme.borderRadius};
  border: 1px solid
    ${({ error }) =>
      error ? lighten(0.4, colors.clRed) : lighten(0.4, colors.label)};
`;

const Paperclip = styled(Icon)`
  flex: 0 0 10px;
  width: 10px;
  height: 20px;
  fill: ${colors.label};
  margin-right: 15px;
`;

const FileInfo = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
`;

const FileDownloadLink = styled.a<{ error: boolean }>`
  color: ${({ error }) => (error ? colors.clRed : colors.label)};
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
  color: ${({ error }) => (error ? colors.clRed : colors.label)};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  line-height: normal;
  white-space: nowrap;
  margin-left: 10px;

  ${media.smallerThanMinTablet`
    display: none;
  `}
`;

const TrashIcon = styled(Icon)`
  flex: 0 0 12px;
  width: 12px;
  height: 14px;
  fill: ${colors.label};
`;

const DeleteButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-left: 10px;

  &:hover {
    ${TrashIcon} {
      fill: ${colors.clRed};
    }
  }
`;

interface Props {
  file: UploadFile;
  onDeleteClick: (event: React.MouseEvent) => void;
}

const FileDisplay = ({ file, onDeleteClick }: Props) => {
  const { error, url, filename, size } = file;
  return (
    <Container error={!!file.error}>
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
      <DeleteButton onClick={onDeleteClick}>
        <TrashIcon name="delete" />
        <ScreenReaderOnly>
          <FormattedMessage {...messages.a11y_removeFile} />
        </ScreenReaderOnly>
      </DeleteButton>
    </Container>
  );
};

export default FileDisplay;
