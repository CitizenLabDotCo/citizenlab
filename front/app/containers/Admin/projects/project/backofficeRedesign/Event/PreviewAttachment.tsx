import React from 'react';

// The preview copies the citizen event page and keeps its icon.
import { Icon } from '@citizenlab/cl2-component-library';
import 'design-system/tokens.css';

import { IFileAttachmentData } from 'api/file_attachments/types';
import useFileById from 'api/files/useFileById';

import styles from './PreviewAttachment.module.css';

interface Props {
  attachment: IFileAttachmentData;
}

const PreviewAttachment = ({ attachment }: Props) => {
  const { data: file } = useFileById(attachment.relationships.file.data.id);

  if (!file) return null;

  return (
    <div className={styles.attachment}>
      <Icon
        name="paperclip"
        width="18px"
        height="18px"
        fill="currentColor"
        className={styles.icon}
      />
      <p className={styles.name}>{file.data.attributes.name}</p>
    </div>
  );
};

export default PreviewAttachment;
