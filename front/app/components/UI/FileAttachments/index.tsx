import React from 'react';

import FileDisplay from './FileDisplay';
import { IAttachedFileData } from './types';

interface Props {
  files: IAttachedFileData[];
  className?: string;
}

const FileAttachments = ({ files, className }: Props) => {
  return (
    <div className={className}>
      {Array.isArray(files) &&
        files.map((file) => <FileDisplay key={file.id} file={file} />)}
    </div>
  );
};

export default FileAttachments;
