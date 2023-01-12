import React from 'react';

// styles
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';
import { ScreenReaderOnly } from 'utils/a11y';

// components
import { Icon, IconButton, Box } from '@citizenlab/cl2-component-library';

// i18n
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import messages from '../../../UI/FileUploader/messages';
import { WrappedComponentProps } from 'react-intl';
import { AttachmentFile } from './SingleFileUploader';

const Container = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 12px;
  margin-bottom: 10px;
  border-radius: ${(props) => props.theme.borderRadius};
  border: 1px solid;
`;

const Paperclip = styled(Icon)`
  flex: 0 0 24px;
  fill: ${colors.textSecondary};
  margin-right: 15px;
`;

const FileInfo = styled(Box)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const DeleteIconButton = styled(IconButton)``;

interface Props {
  file: AttachmentFile;
  onDeleteClick: () => void;
}

const FileDisplay = ({
  file,
  intl: { formatMessage },
  onDeleteClick,
}: Props & WrappedComponentProps) => {
  const { name } = file;
  if (name) {
    return (
      <Container>
        <Paperclip name="paperclip" ariaHidden />
        <FileInfo flex={'1'}>
          <>
            <ScreenReaderOnly>
              <FormattedMessage {...messages.a11y_file} />
            </ScreenReaderOnly>
            {name}
          </>
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
  }
  return null;
};

export default injectIntl(FileDisplay);
