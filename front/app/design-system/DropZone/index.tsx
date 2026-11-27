import React from 'react';

import {
  Button,
  DropItem,
  DropZone as AriaDropZone,
  FileDropItem,
  FileTrigger,
  DropZoneProps as AriaDropZoneProps,
} from 'react-aria-components';

import { FormattedMessage } from 'utils/cl-intl';

import Icon from '../Icon';

import styles from './DropZone.module.css';
import messages from './messages';
import '../tokens.css';

type DropEvent = Parameters<NonNullable<AriaDropZoneProps['onDrop']>>[0];

type DropZoneProps = {
  // Called with the files picked with browse or dropped on the zone.
  onSelect: (files: File[]) => void;
  // MIME types, as for FileTrigger.
  acceptedFileTypes?: string[];
  allowsMultiple?: boolean;
  // Set on the drop zone element.
  id?: string;
  'aria-label'?: string;
  'data-cy'?: string;
};

const isFile = (item: DropItem): item is FileDropItem => item.kind === 'file';

const DropZone = ({
  onSelect,
  acceptedFileTypes,
  allowsMultiple = false,
  id,
  'aria-label': ariaLabel,
  'data-cy': dataCy,
}: DropZoneProps) => {
  const accepts = (type: string) =>
    !acceptedFileTypes || acceptedFileTypes.includes(type);

  const handleDrop = async (e: DropEvent) => {
    const items = e.items.filter(isFile).filter((item) => accepts(item.type));
    const files = await Promise.all(items.map((item) => item.getFile()));
    if (files.length === 0) return;
    onSelect(allowsMultiple ? files : files.slice(0, 1));
  };

  const handleSelect = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    onSelect(Array.from(fileList));
  };

  return (
    <AriaDropZone
      className={styles.dropZone}
      getDropOperation={(types) =>
        !acceptedFileTypes || acceptedFileTypes.some((type) => types.has(type))
          ? 'copy'
          : 'cancel'
      }
      onDrop={handleDrop}
      // DropZone takes no id prop; render sets it on its own element.
      render={id ? (props) => <div {...props} id={id} /> : undefined}
      aria-label={ariaLabel}
      data-cy={dataCy}
    >
      {({ isDropTarget }) => (
        <>
          <Icon name="upload-20" className={styles.icon} />
          <span className={styles.text}>
            {isDropTarget ? (
              <FormattedMessage {...messages.dropToUpload} />
            ) : (
              <FormattedMessage
                {...messages.dropOrBrowse}
                values={{
                  browse: (
                    <FileTrigger
                      acceptedFileTypes={acceptedFileTypes}
                      allowsMultiple={allowsMultiple}
                      onSelect={handleSelect}
                    >
                      <Button className={styles.browse}>
                        <FormattedMessage {...messages.browse} />
                      </Button>
                    </FileTrigger>
                  ),
                }}
              />
            )}
          </span>
        </>
      )}
    </AriaDropZone>
  );
};

export default DropZone;
