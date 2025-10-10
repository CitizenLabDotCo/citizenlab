import React from 'react';

import { useParams } from 'utils/router';

import { IFileAttachmentData } from 'api/file_attachments/types';
import useFiles from 'api/files/useFiles';

import { ScreenReaderOnly } from 'utils/a11y';
import { FormattedMessage } from 'utils/cl-intl';

import messages from '../../FileUploader/messages';

type Props = {
  fileAttachments?: IFileAttachmentData[];
};
const ScreenReaderFilesList = ({ fileAttachments }: Props) => {
  const { projectId } = useParams({ strict: false });
  const { data: files } = useFiles({
    project: projectId ? [projectId] : [],
  });

  if (!files) return null;

  const attachedFiles =
    fileAttachments?.map((fileAttachment) => fileAttachment.id) || [];
  const filesToAnnounce = files.data
    .filter((file) => attachedFiles.includes(file.id))
    .map((file) => ({
      id: file.id,
      name: file.attributes.name,
    }));

  const fileNames = filesToAnnounce.map((file) => file.name).join(', ');

  return (
    <ScreenReaderOnly aria-live="polite">
      <FormattedMessage
        {...(filesToAnnounce.length > 0
          ? messages.a11y_filesToBeUploaded
          : messages.a11y_noFiles)}
        values={{ fileNames }}
      />
    </ScreenReaderOnly>
  );
};

export default ScreenReaderFilesList;
