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
    <Box m="100px" w="800px">
      <Title>Hello world!</Title>
      <Box>
        <FileUploader
          id=""
          onFileAdd={onAddFile}
          onFileRemove={onRemoveFile}
          files={null}
        />
      </Box>
    </Box>
  );
};

export default Testing;
