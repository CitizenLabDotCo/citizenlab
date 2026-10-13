import React, { useRef } from 'react';

import { Box, Icon, Text, colors } from '@citizenlab/cl2-component-library';
import { useDrag, useDrop } from 'react-dnd';
import styled from 'styled-components';

import { IFileAttachmentData } from 'api/file_attachments/types';
import useFileById from 'api/files/useFileById';

import IconAction from 'components/UI/IconAction';

import { useIntl } from 'utils/cl-intl';

import messages from './components/messages';

const DRAG_TYPE = 'FILE_ATTACHMENT';

const FileLink = styled.a`
  color: inherit;
  text-decoration: none;

  &:hover {
    color: inherit;
    text-decoration: underline;
  }
`;

interface DragItem {
  index: number;
}

interface Props {
  fileAttachment: IFileAttachmentData;
  index: number;
  moveRow: (fromIndex: number, toIndex: number) => void;
  dropRow: () => void;
  onDeleteClick: (event: React.MouseEvent) => void;
  disabled: boolean;
}

const BoFileAttachmentDisplay = ({
  fileAttachment,
  index,
  moveRow,
  dropRow,
  onDeleteClick,
  disabled,
}: Props) => {
  const { formatMessage } = useIntl();
  const ref = useRef<HTMLDivElement | null>(null);
  const { data: file } = useFileById(fileAttachment.relationships.file.data.id);

  const [, drop] = useDrop<DragItem>({
    accept: DRAG_TYPE,
    hover(item, monitor) {
      const clientOffset = monitor.getClientOffset();
      if (!ref.current || !clientOffset || item.index === index) return;

      const { top, bottom } = ref.current.getBoundingClientRect();
      const middleY = (bottom - top) / 2;
      const pointerY = clientOffset.y - top;
      if (item.index < index && pointerY < middleY) return;
      if (item.index > index && pointerY > middleY) return;

      moveRow(item.index, index);
      item.index = index;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: DRAG_TYPE,
    item: { index },
    canDrag: !disabled,
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    end: dropRow,
  });

  drag(drop(ref));

  if (!file) return null;

  const { name, content } = file.data.attributes;

  return (
    <Box
      ref={ref}
      display="flex"
      alignItems="center"
      gap="8px"
      minHeight="28px"
      mr="-4px"
      cursor={disabled ? undefined : 'grab'}
      opacity={isDragging ? 0 : 1}
    >
      <Icon
        name="sort"
        width="12px"
        height="16px"
        fill={colors.coolGrey500}
        ariaHidden
      />
      <Icon
        name="paperclip"
        width="16px"
        height="16px"
        fill={colors.coolGrey500}
        ariaHidden
      />
      <Box flex="1" minWidth="0">
        <Text
          variant="boControl"
          fontSize="xs"
          lineHeight="16px"
          m="0"
          overflow="hidden"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
          title={name}
        >
          <FileLink
            href={content.url}
            download={name}
            target="_blank"
            rel="noopener noreferrer"
            draggable={false}
          >
            {name}
          </FileLink>
        </Text>
      </Box>
      <IconAction
        icon="close"
        tooltip={formatMessage(messages.removeFile)}
        ariaLabel={formatMessage(messages.removeFileAriaLabel, {
          fileName: name,
        })}
        disabled={disabled}
        onClick={onDeleteClick}
      />
    </Box>
  );
};

export default BoFileAttachmentDisplay;
