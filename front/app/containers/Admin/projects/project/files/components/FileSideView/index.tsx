import React from 'react';

import {
  Box,
  colors,
  StatusLabel,
  Title,
} from '@citizenlab/cl2-component-library';

import useFileById from 'api/files/useFileById';

import SideModal from 'components/UI/SideModal';

import FileAnalysis from './components/FileAnalysis';
import FileEditForm from './components/FileEditForm';
import FileMetadata from './components/FileMetadata';
import FilePreview from './components/FilePreview';

type Props = {
  opened: boolean;
  selectedFileId: string | null;
  setSideViewOpened: (opened: boolean) => void;
};

const FileSideView = ({ opened, selectedFileId, setSideViewOpened }: Props) => {
  const { data: file } = useFileById(selectedFileId);

  return (
    <SideModal
      opened={opened}
      close={() => setSideViewOpened(false)}
      width="1100px"
    >
      <Box display="flex" p="24px" mt="24px" gap="32px" minHeight="96dvh">
        <Box width="50%">
          <StatusLabel
            text="CATEGORY" // TODO: Replace with actual category once implemented
            backgroundColor={colors.teal500}
            h="16px"
          />

          <Title variant="h2" color="textPrimary" mt="12px">
            {file?.data.attributes.name}
          </Title>

          {file && (
            <Box>
              <FileMetadata file={file} />
              <Box mt="32px">
                <FileEditForm file={file} />
              </Box>
              <Box mt="32px">
                <FilePreview file={file} />
              </Box>
            </Box>
          )}
        </Box>

        <Box width="50%" display="flex" flexDirection="column" minHeight="0">
          {file && <FileAnalysis file={file} />}
        </Box>
      </Box>
    </SideModal>
  );
};

export default FileSideView;
