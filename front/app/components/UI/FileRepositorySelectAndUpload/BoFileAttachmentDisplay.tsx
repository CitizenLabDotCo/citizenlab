import React, { useRef } from 'react';

import { Box, Icon, Text, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { IFileAttachmentData } from 'api/file_attachments/types';
import useFileById from 'api/files/useFileById';

import useSortableItem from 'hooks/useSortableItem';

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
