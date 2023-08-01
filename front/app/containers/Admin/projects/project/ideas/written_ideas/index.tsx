import React from 'react';

// api
import useAddHandwrittenIdea from 'api/handwritten_ideas/useAddHandwrittenIdea';

// components
import { Title, Box } from '@citizenlab/cl2-component-library';
import FileUploader from 'components/UI/FileUploader';

// typings
import { UploadFile } from 'typings';

const Testing = () => {
  const { mutate: addHandwrittenIdea } = useAddHandwrittenIdea();

  const onAddFile = (file: UploadFile) => {
    addHandwrittenIdea({
      file: { file: file.base64 },
    });
  };

  const onRemoveFile = () => {};

  return (
    <Box mx="100px" w="800px">
      <Title>Written idea importer</Title>
      <Box>
        <FileUploader
          id="rjferiugp"
          onFileAdd={onAddFile}
          onFileRemove={onRemoveFile}
          files={null}
        />
      </Box>
    </Box>
  );
};

export default Testing;
