import React, { useState } from 'react';

import { IFileData } from 'api/files/types';

import filesMessages from 'containers/Admin/projects/project/files/components/messages';

import UserName from 'components/UI/UserName';

import AlertDialog from 'design-system/AlertDialog';
import 'design-system/tokens.css';

import { useIntl } from 'utils/cl-intl';
import { saveFileToDisk } from 'utils/fileUtils';

import FileActionsMenu, { FileAction } from '../FileActionsMenu';
import FileRow from '../FileRow';

import styles from './ManagedFileRow.module.css';
import messages from './messages';

interface Props {
  file: IFileData;
  onDelete: () => void;
}

const ManagedFileRow = ({ file, onDelete }: Props) => {
  const { formatMessage, formatDate } = useIntl();
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);

  const { name, mime_type, created_at, category, content } = file.attributes;
  const uploaderId = file.relationships.uploader?.data?.id;
  const usedAsAttachment = !!file.relationships.attachments?.data.length;

  const actions: FileAction[] = [
    {
      name: 'view',
      label: formatMessage(filesMessages.viewFile),
      onClick: () => window.open(content.url, '_blank', 'noopener'),
    },
    {
      name: 'download',
      label: formatMessage(filesMessages.downloadFile),
      onClick: () => saveFileToDisk(file),
    },
    {
      name: 'delete',
      label: formatMessage(filesMessages.deleteFile),
      onClick: () => setDeleteModalOpened(true),
    },
  ];

  return (
    <>
      <FileRow
        name={name}
        mimeType={mime_type}
        meta={
          <div className={styles.meta}>
            <span>
              {formatDate(created_at, {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
              {' · '}
              {formatMessage(filesMessages[category])}
              {uploaderId && ' · '}
            </span>
            {uploaderId && (
              <UserName
                userId={uploaderId}
                fontSize={12}
                color="var(--gv-text-secondary)"
              />
            )}
          </div>
        }
        actions={
          <FileActionsMenu
            ariaLabel={formatMessage(messages.fileActions, { fileName: name })}
            actions={actions}
          />
        }
      />
      <AlertDialog
        isOpen={deleteModalOpened}
        onOpenChange={setDeleteModalOpened}
        title={formatMessage(filesMessages.deleteFile)}
        confirmLabel={formatMessage(filesMessages.deleteFile)}
        onConfirm={() => {
          setDeleteModalOpened(false);
          onDelete();
        }}
      >
        {formatMessage(filesMessages.confirmDelete)}
        {usedAsAttachment && (
          <span className={styles.attachmentNote}>
            {formatMessage(filesMessages.fileBeingUsed)}{' '}
            {formatMessage(filesMessages.willRemoveFromAllLocations)}
          </span>
        )}
      </AlertDialog>
    </>
  );
};

export default ManagedFileRow;
