import React from 'react';

import { Icon, Image, colors } from '@citizenlab/cl2-component-library';

import useProjectFolderImage from 'api/project_folder_images/useProjectFolderImage';
import { MiniProjectFolder } from 'api/project_folders_mini/types';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';

import sharedMessages from '../../_shared/messages';
import useFolderItemActions from '../Actions/useFolderItemActions';
import { ArrangePlace } from '../Arrange/arrangeTargets';
import useDragArrange from '../Arrange/useDragArrange';
import MoreActions from '../Menu/MoreActions';
import messages from '../messages';

import ContainerTile from './ContainerTile';

interface Props {
  folder: MiniProjectFolder;
  // Where it can be arranged, when it can.
  place?: ArrangePlace;
}

// A folder shows its image as a thumbnail where the icon goes, and the folder
// icon when it has none.
const FolderTile = ({ folder, place }: Props) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const { title_multiloc, publication_status, visible_projects_count } =
    folder.attributes;

  const { data: image } = useProjectFolderImage({
    folderId: folder.id,
    imageId: folder.relationships.images.data[0]?.id,
  });
  const imageUrl = image?.data.attributes.versions.small;
  const title = localize(title_multiloc);
  const { entries, arrangeTo } = useFolderItemActions(folder, place);
  const drag = useDragArrange({ id: folder.id, place, arrangeTo });

  const meta = [
    publication_status === 'draft' && formatMessage(sharedMessages.draft),
    formatMessage(messages.projectsCount, { count: visible_projects_count }),
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <ContainerTile
      level={{ kind: 'folder', id: folder.id }}
      title={title}
      meta={meta}
      actions={<MoreActions entries={entries} />}
      drag={drag}
      media={
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
    />
  );
};

export default FolderTile;
