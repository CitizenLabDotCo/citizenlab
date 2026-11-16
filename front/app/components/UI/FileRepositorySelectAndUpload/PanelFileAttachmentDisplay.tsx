import React, { useRef } from 'react';

import { IFileAttachmentData } from 'api/file_attachments/types';
import useFileById from 'api/files/useFileById';

import useSortableItem from 'hooks/useSortableItem';

import Icon from 'design-system/Icon';
import IconButton from 'design-system/IconButton';
import 'design-system/tokens.css';

import { useIntl } from 'utils/cl-intl';

import styles from './PanelFileAttachmentDisplay.module.css';
import messages from './components/messages';

const DRAG_TYPE = 'FILE_ATTACHMENT';

interface Props {
  fileAttachment: IFileAttachmentData;
  index: number;
  moveRow: (fromIndex: number, toIndex: number) => void;
  dropRow: () => void;
  onRemove: () => void;
  disabled: boolean;
}

const PanelFileAttachmentDisplay = ({
  fileAttachment,
  index,
  moveRow,
  dropRow,
  onRemove,
  disabled,
}: Props) => {
  const { formatMessage } = useIntl();
  const ref = useRef<HTMLDivElement | null>(null);
  const { data: file } = useFileById(fileAttachment.relationships.file.data.id);

  const { drag, drop, isDragging } = useSortableItem({
    type: DRAG_TYPE,
    item: { index },
    ref,
    moveRow,
    onDrop: dropRow,
    canDrag: !disabled,
  });

  drag(drop(ref));

  if (!file) return null;

  const { name, content } = file.data.attributes;

  return (
    <div
      ref={ref}
      className={styles.row}
      data-disabled={disabled}
      data-dragging={isDragging}
    >
      <Icon name="grip-vertical-16" className={styles.icon} />
      <Icon name="paperclip-16" className={styles.icon} />
      <p className={styles.name} title={name}>
        <a
          className={styles.link}
          href={content.url}
          download={name}
          target="_blank"
          rel="noopener noreferrer"
          draggable={false}
        >
          {name}
        </a>
      </p>
      <IconButton
        icon="x-14"
        aria-label={formatMessage(messages.removeFileAriaLabel, {
          fileName: name,
        })}
        isDisabled={disabled}
        onPress={onRemove}
      />
    </div>
  );
};

export default PanelFileAttachmentDisplay;
