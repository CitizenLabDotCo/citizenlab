import React from 'react';

// api
import useAddHandwrittenIdea from 'api/handwritten_ideas/useAddHandwrittenIdea';

// router
import { useParams } from 'react-router-dom';
import clHistory from 'utils/cl-router/history';

// components
import { Title, Box, Spinner } from '@citizenlab/cl2-component-library';
import FileUploader from 'components/UI/FileUploader';

// typings
import { UploadFile } from 'typings';

const Testing = () => {
  const { projectId } = useParams() as { projectId: string };
  const { mutate: addHandwrittenIdea, isLoading } = useAddHandwrittenIdea();

  const onAddFile = (file: UploadFile) => {
    addHandwrittenIdea(
      {
        idea: {
          project_id: projectId,
          image: file.base64,
          locale: 'en',
        },
      },
      {
        onSuccess: (data) => {
          const { slug } = data.data.attributes;
          clHistory.push(`/ideas/${slug}`);
        },
      }
    );
  };

  const onRemoveFile = () => {};

  return (
    <Box mx="100px" w="800px">
      <Title>Written idea importer</Title>
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
