import React, { useState } from 'react';

// api
import useAddHandwrittenIdeas from 'api/handwritten_ideas/useAddHandwrittenIdeas';

// router
import { useParams } from 'react-router-dom';

// components
import { Title, Box, Spinner } from '@citizenlab/cl2-component-library';
import FileUploader from 'components/UI/FileUploader';

// typings
import { UploadFile } from 'typings';

const Testing = () => {
  const { projectId } = useParams() as { projectId: string };
  const { mutate: addHandwrittenIdeas, isLoading } = useAddHandwrittenIdeas();
  const [numIdeasAdded, setNumIdeasAdded] = useState<number | null>(null);

  const onAddFile = (file: UploadFile) => {
    addHandwrittenIdeas(
      {
        project_id: projectId,
        file: file.base64,
        locale: 'en',
      },
      {
        onSuccess: (data) => {
          setNumIdeasAdded(data.data.length);
          console.log(data);
        },
      }
    );
  };

  const onRemoveFile = () => {};

  return (
    <Box mx="100px" w="800px">
      <Title>Written idea importer</Title>
      <Box pb="10px">
        Upload a PDF file of scanned forms. Max 40 pages. The PDF must use a
        form printed from this project.
      </Box>
      {numIdeasAdded && (
        <Box pb="10px">
          {numIdeasAdded} ideas extracted and uploaded. Go to the input manager
          to view and approve these ideas.
        </Box>
      )}
      <Box>
        {isLoading ? (
          <Spinner />
        ) : (
          <FileUploader
            id="written-ideas-importer"
            onFileAdd={onAddFile}
            onFileRemove={onRemoveFile}
            files={null}
          />
        )}
      </Box>
    </Box>
  );
};

export default Testing;
