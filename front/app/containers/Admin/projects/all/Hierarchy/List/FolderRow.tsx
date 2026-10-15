import React from 'react';

import { Icon, Image, Td, colors } from '@citizenlab/cl2-component-library';

import useProjectFolderImage from 'api/project_folder_images/useProjectFolderImage';
import { MiniProjectFolder } from 'api/project_folders_mini/types';
import { PublicationStatus } from 'api/projects/types';

import useLocalize from 'hooks/useLocalize';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';

import ManagerBubbles from '../../_shared/ManagerBubbles';
import sharedMessages from '../../_shared/messages';
import FolderActions from '../Actions/FolderActions';
import messages from '../messages';

import ActionsCell from './ActionsCell';
import { ColumnKey } from './columns';
import ItemRow from './ItemRow';
import TextCell from './TextCell';
import TitleCell from './TitleCell';
import { Managers } from './useManagers';

const FOLDER_STATUS_MESSAGES: Record<PublicationStatus, MessageDescriptor> = {
  published: messages.live,
  draft: sharedMessages.draft,
  archived: sharedMessages.archived,
};

interface Props {
  folder: MiniProjectFolder;
  columns: ColumnKey[];
  managers: Managers;
}

// A folder uses the project columns for its name, project count, status and
// managers; the others stay empty.
const FolderRow = ({ folder, columns, managers }: Props) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const { title_multiloc, publication_status, visible_projects_count } =
    folder.attributes;

  const { data: image } = useProjectFolderImage({
    folderId: folder.id,
    imageId: folder.relationships.images.data[0]?.id,
  });
  const imageUrl = image?.data.attributes.versions.small;

  return (
    <ItemRow>
      {columns.map((column) =>
        column === 'project' ? (
          <TitleCell
            key={column}
            lead={
              imageUrl ? (
                <Image
                  src={imageUrl}
                  alt=""
                  width="100%"
                  height="100%"
                  objectFit="cover"
                />
              ) : (
                <Icon
                  name="folder-outline"
                  width="16px"
                  height="16px"
                  fill={colors.coolGrey600}
                />
              )
            }
            title={localize(title_multiloc)}
            target={{ level: { kind: 'folder', id: folder.id } }}
            note={formatMessage(messages.projectsCount, {
              count: visible_projects_count,
            })}
          />
        ) : column === 'status' ? (
          <TextCell key={column}>
            {formatMessage(FOLDER_STATUS_MESSAGES[publication_status])}
          </TextCell>
        ) : column === 'managers' ? (
          <Td key={column}>
            <ManagerBubbles managers={managers} />
          </Td>
        ) : (
          <Td key={column} />
        )
      )}
      <ActionsCell>
        <FolderActions folder={folder} />
      </ActionsCell>
    </ItemRow>
  );
};

export default FolderRow;
