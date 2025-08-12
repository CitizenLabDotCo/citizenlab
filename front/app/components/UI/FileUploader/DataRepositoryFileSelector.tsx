import React from 'react';

import SelectExistingFile from './components/SelectExistingFile';
import { FileType } from './FileDisplay';

type Props = {
  files?: FileType[];
  onFileAddFromRepository?: (files: FileType[]) => void;
};
const DataRepositoryFileSelector = ({
  onFileAddFromRepository,
  files,
}: Props) => {
  return (
    <>
      <SelectExistingFile
        attachedFiles={files}
        onFileAddFromRepository={onFileAddFromRepository}
      />
    </>
  );
};

export default DataRepositoryFileSelector;
