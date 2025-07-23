import React from 'react';

import { Text } from '@citizenlab/cl2-component-library';

import { IFile } from 'api/files/types';

import useLocalize from 'hooks/useLocalize';

type Props = {
  file: IFile;
};

const FileInfo = ({ file }: Props) => {
  const localize = useLocalize();
  return (
    <>
      <Text>{localize(file.data.attributes.description_multiloc)}</Text>
    </>
  );
};

export default FileInfo;
