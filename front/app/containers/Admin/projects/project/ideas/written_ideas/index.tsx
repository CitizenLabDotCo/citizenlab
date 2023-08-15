import React, { useState } from 'react';

// api
import useAddHandwrittenIdeas from 'api/handwritten_ideas/useAddHandwrittenIdeas';

// router
import { useParams } from 'react-router-dom';

// components
import { Title, Box, Spinner } from '@citizenlab/cl2-component-library';
import FileUploader from 'components/UI/FileUploader';
import GoBackButtonSolid from 'components/UI/GoBackButton/GoBackButtonSolid';

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
    <Box>
      <Box w="100%" display="flex">
        <GoBackButtonSolid
          text="Back to input manager"
          linkTo={`/admin/projects/${projectId}/ideas`}
        />
      </Box>
      <Title variant="h2" color="primary" fontWeight="normal" mb="20px">
        Written idea importer
      </Title>
      <Box mb="28px">
        Upload a <strong>PDF file of scanned forms</strong>. The PDF must use a
        form printed from this project available here.
      </Box>

      <Box>
        {isLoading ? (
          <Spinner />
        ) : (
          <Box w="700px">
            <FileUploader
              id="written-ideas-importer"
              onFileAdd={onAddFile}
              onFileRemove={onRemoveFile}
              files={null}
            />
          </Box>
        )}
      </Box>
      {numIdeasAdded && (
        <Box pb="10px">
          {numIdeasAdded} ideas extracted and uploaded. Handwriting scanning is
          not 100% accurate so you must review and approved before they are
          imported.
        </Box>
      )}
    </Box>
  );
};

export default Testing;
