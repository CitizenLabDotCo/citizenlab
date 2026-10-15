import React from 'react';

import useProjectFolderById from 'api/project_folders/useProjectFolderById';
import useSpace from 'api/spaces/useSpace';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocalize from 'hooks/useLocalize';

import Breadcrumbs, { TBreadcrumbs } from 'components/UI/Breadcrumbs';

import { useIntl } from 'utils/cl-intl';
import { usePermission } from 'utils/permissions';

import allMessages from '../messages';

import { Level } from './level';
import useLevelSearch from './useLevelSearch';

interface Props {
  level: Exclude<Level, { kind: 'root' }>;
  // Whether the top level is where this user lands. When they land inside a
  // space or folder, there's nothing above it for them to go back to.
  showRoot: boolean;
}

const LevelBreadcrumbs = ({ level, showRoot }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const levelSearch = useLevelSearch();
  const spacesEnabled = useFeatureFlag({ name: 'spaces' });

  const { data: folder } = useProjectFolderById(
    level.kind === 'folder' ? level.id : undefined
  );
  // A folder can keep its space after spaces are turned off. The top level
  // then lists the folder itself, so its space isn't a level to go back to.
  const folderSpaceId = spacesEnabled
    ? folder?.data.attributes.space_id
    : undefined;
  const spaceId = level.kind === 'space' ? level.id : folderSpaceId;
  const canOpenSpace = usePermission({
    item: 'space',
    action: 'manage_projects_and_folders',
    context: { spaceId },
  });
  const { data: space } = useSpace(canOpenSpace ? spaceId : undefined);

  const breadcrumbs: TBreadcrumbs = [];

  if (showRoot) {
    breadcrumbs.push({
      label: formatMessage(allMessages.projects),
      link: { to: '/admin/projects', search: levelSearch({ kind: 'root' }) },
    });
  }

  if (level.kind === 'folder' && space) {
    breadcrumbs.push({
      label: localize(space.data.attributes.title_multiloc),
      link: {
        to: '/admin/projects',
        search: levelSearch({ kind: 'space', id: space.data.id }),
      },
    });
  }

  const current = level.kind === 'folder' ? folder : space;
  if (current) {
    breadcrumbs.push({
      label: localize(current.data.attributes.title_multiloc),
    });
  }

  return (
    <Breadcrumbs
      breadcrumbs={breadcrumbs}
      variant="backofficeRedesign"
      highlightCurrentPage
    />
  );
};

export default LevelBreadcrumbs;
