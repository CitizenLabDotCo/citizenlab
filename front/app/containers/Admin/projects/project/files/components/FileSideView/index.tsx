import React, { useState } from 'react';

import {
  Box,
  colors,
  IconButton,
  StatusLabel,
  Title,
} from '@citizenlab/cl2-component-library';

import useFileById from 'api/files/useFileById';

import SideModal from 'components/UI/SideModal';

import { useIntl } from 'utils/cl-intl';

import FilePreview from '../FilePreview';
import messages from '../messages';

import FileAnalysis from './components/FileAnalysis';
import FileEditForm from './components/FileEditForm';
import FileInfo from './components/FileInfo';
import FileMetadata from './components/FileMetadata';

type Props = {
  opened: boolean;
  selectedFileId: string | null;
  setSideViewOpened: (opened: boolean) => void;
};

const FileSideView = ({ opened, selectedFileId, setSideViewOpened }: Props) => {
  const { formatMessage } = useIntl();
  const { data: file } = useFileById(selectedFileId);
  const [editingMetadata, setEditingMetadata] = useState(false);

  return (
    <SideModal
      opened={opened}
      close={() => setSideViewOpened(false)}
      width="1400px"
    >
      <Box display="flex" height="100dvh" overflow="hidden">
        {file?.data && (
          <>
            {/* Left scrollable section */}
            <Box width="55%" overflowY="auto" p="24px" pr="32px">
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
                  iconName="edit"
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
                    <FileInfo file={file} />
                  )}
                </Box>
                <Box mt="32px">
                  <FilePreview file={file} />
                </Box>
              </Box>
            </Box>

            {/* Right fixed section */}
            <Box
              width="45%"
              p="24px"
              borderLeft={`1px solid ${colors.grey300}`}
              display="flex"
              flexDirection="column"
              justifyContent="flex-start"
            >
              <FileAnalysis />
            </Box>
          </>
        )}
      </Box>
    </SideModal>
  );
};

export default FileSideView;
