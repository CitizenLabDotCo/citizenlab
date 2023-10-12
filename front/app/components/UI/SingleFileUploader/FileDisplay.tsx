import React from 'react';

// styles
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';
import { ScreenReaderOnly } from 'utils/a11y';

// components
import { Icon, IconButton, Box } from '@citizenlab/cl2-component-library';

// i18n
import { useIntl, FormattedMessage } from 'utils/cl-intl';
import messages from 'components/UI/FileUploader/messages';

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
  fileName: string;
  onDeleteClick: () => void;
}

const FileDisplay = ({ fileName, onDeleteClick }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Container>
      <Paperclip name="paperclip" ariaHidden />
      <FileInfo flex={'1'}>
        <>
          <ScreenReaderOnly>
            <FormattedMessage {...messages.a11y_file} />
          </ScreenReaderOnly>
          {fileName}
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
};

export default FileDisplay;
