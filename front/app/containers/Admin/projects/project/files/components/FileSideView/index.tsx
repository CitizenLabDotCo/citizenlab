import React, { useState } from 'react';

import {
  Box,
  colors,
  IconButton,
  StatusLabel,
  Title,
} from '@citizenlab/cl2-component-library';

import useFileById from 'api/files/useFileById';

import useFeatureFlag from 'hooks/useFeatureFlag';

import SideModal from 'components/UI/SideModal';

import { useIntl } from 'utils/cl-intl';

import FilePreview from '../FilePreview';
import { AUDIO_MIMETYPES } from '../FilePreview/utils';
import messages from '../messages';

import FileDescription from './components/FileDescription';
import FileEditForm from './components/FileEditForm';
import FileMetadata from './components/FileMetadata';
import FileTranscription from './components/FileTranscription';

type Props = {
  opened: boolean;
  selectedFileId: string | null;
  setSideViewOpened: (opened: boolean) => void;
};

const FileSideView = ({ opened, selectedFileId, setSideViewOpened }: Props) => {
  const { formatMessage } = useIntl();
  const { data: file } = useFileById(selectedFileId);
  const [editingMetadata, setEditingMetadata] = useState(false);

  const isTranscriptionEnabled = useFeatureFlag({
    name: 'data_repository_transcription',
  });

  return (
    <SideModal
      opened={opened}
      close={() => setSideViewOpened(false)}
      width="50dvw"
    >
      <Box display="flex" height="100dvh" overflow="hidden">
        {file?.data && (
          <>
            {/* Left scrollable section */}
            <Box w="100%" overflowY="auto" p="24px" pr="32px">
              <StatusLabel
                text={formatMessage(messages[file.data.attributes.category])}
                backgroundColor={colors.teal500}
                h="16px"
              />

              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                mt="16px"
              >
                <Title variant="h2" color="textPrimary" mt="12px">
                  {file.data.attributes.name}
                </Title>

                <IconButton
                  iconName={editingMetadata ? 'close' : 'edit'}
                  iconColor={colors.coolGrey500}
                  onClick={() => setEditingMetadata(!editingMetadata)}
                  a11y_buttonActionMessage={formatMessage(messages.editFile)}
                />
              </Box>

              <Box>
                <FileMetadata file={file} />
                <Box mt="32px">
                  {editingMetadata ? (
                    <FileEditForm
                      file={file}
                      setEditingMetadata={setEditingMetadata}
                    />
                  ) : (
                    <FileDescription file={file} />
                  )}
                </Box>
                <Box mt="32px">
                  <FilePreview file={file} />
                </Box>

                {isTranscriptionEnabled &&
                  file.data.relationships.transcript.data && (
                    <Box mt="32px">
                      <FileTranscription file={file.data} />
                    </Box>
                  )}
              </Box>
            </Box>
          </>
        )}
      </Box>
    </SideModal>
  );
};

export default FileSideView;
