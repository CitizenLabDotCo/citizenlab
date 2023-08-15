import React, { useState } from 'react';

// hooks
import useAddOfflineIdeas from 'api/import_ideas/useAddOfflineIdeas';
import useLocale from 'hooks/useLocale';

// router
import { useParams } from 'react-router-dom';

// components
import { Title, Box, Spinner } from '@citizenlab/cl2-component-library';
import FileUploader from 'components/UI/FileUploader';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// typings
import { UploadFile } from 'typings';
import { isNilOrError } from 'utils/helperUtils';

const TextButton = styled.button`
  all: unset;
  display: inline;
  cursor: pointer;
  text-decoration-line: underline;

  &:hover {
    color: ${colors.grey600};
  }
`;

const ImportSection = () => {
  const { projectId } = useParams() as { projectId: string };
  const { mutate: addOfflineIdeas, isLoading } = useAddOfflineIdeas();
  const [numIdeasAdded, setNumIdeasAdded] = useState<number | null>(null);
  const locale = useLocale();

  if (isNilOrError(locale)) return null;

  const onAddFile = (file: UploadFile) => {
    addOfflineIdeas(
      {
        project_id: projectId,
        file: file.base64,
        locale,
      },
      {
        onSuccess: (data) => {
          setNumIdeasAdded(data.data.length);
          // console.log(data);
        },
      }
    );
  };

  return (
    <Box w="100%" display="flex" justifyContent="center" bgColor={colors.white}>
      <Box p="20px" w="800px">
        <Title variant="h1" color="primary" fontWeight="normal" mb="20px">
          Written idea importer
        </Title>
        <Box mb="28px">
          Upload a <strong>PDF file of scanned forms</strong>. The PDF must use
          a form printed from this project available{' '}
          <TextButton>here</TextButton>.
        </Box>

        <Box>
          {isLoading ? (
            <Spinner />
          ) : (
            <Box w="700px">
              <FileUploader
                id="written-ideas-importer"
                onFileAdd={onAddFile}
                files={null}
              />
            </Box>
          )}
        </Box>
        {numIdeasAdded && (
          <Box pb="10px">
            {numIdeasAdded} ideas extracted and uploaded. Handwriting scanning
            is not 100% accurate so you must review and approved before they are
            imported.
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ImportSection;
