import { useMemo } from 'react';

import {
  AdminSearchFolder,
  AdminSearchItem,
  AdminSearchProject,
  AdminSearchSpace,
} from 'api/admin_search/types';
import useAdminSearch from 'api/admin_search/useAdminSearch';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useAuthUser from 'api/me/useAuthUser';

import { areFeaturesActive } from 'hooks/useFeatureFlags';
import useLocalize from 'hooks/useLocalize';

import projectsMessages from 'containers/Admin/projects/all/messages';

import { useIntl } from 'utils/cl-intl';
import { hasPermission } from 'utils/permissions';

import sidebarMessages from '../messages';

import { QuickSearchEntry } from './filterEntries';
import staticEntries from './staticEntries';

const isProject = (item: AdminSearchItem): item is AdminSearchProject =>
  item.type === 'project_admin_search';
const isFolder = (item: AdminSearchItem): item is AdminSearchFolder =>
  item.type === 'folder_admin_search';
const isSpace = (item: AdminSearchItem): item is AdminSearchSpace =>
  item.type === 'space_admin_search';

const useQuickSearchEntries = () => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { data: authUser } = useAuthUser();
  const { data: appConfiguration } = useAppConfiguration();

  // The endpoint only returns what the current user manages, so moderators
  // only get their own projects, phases, folders and spaces.
  const { data } = useAdminSearch();

  return useMemo(() => {
    const pageEntries: QuickSearchEntry[] = staticEntries
      .filter(
        (entry) =>
          areFeaturesActive(appConfiguration?.data.attributes.settings, {
            names: entry.featureNames ?? [],
            onlyCheckAllowed: entry.onlyCheckAllowed,
          }) &&
          hasPermission({
            item: { type: 'route', path: entry.to },
            action: 'access',
            user: authUser,
            appConfig: appConfiguration?.data,
          })
      )
      .map((entry) => ({
        id: entry.name,
        group: 'pages',
        breadcrumbs: [
          ...(entry.section ? [formatMessage(entry.section)] : []),
          formatMessage(entry.message),
        ],
        link: { to: entry.to },
        // Every path starts with /admin, so leave that out of what matches.
        keywords: entry.to.replace(/^\/admin\//, ''),
      }));

    const items = data?.data ?? [];
    const projectsLabel = formatMessage(sidebarMessages.projects);

    const spaceEntries: QuickSearchEntry[] = items
      .filter(isSpace)
      .map((space) => ({
        id: space.id,
        group: 'spaces',
        breadcrumbs: [
          formatMessage(projectsMessages.spaces),
          localize(space.attributes.title_multiloc),
        ],
        link: {
          to: '/admin/projects/spaces/$spaceId',
          params: { spaceId: space.id },
        },
      }));

    const folderEntries: QuickSearchEntry[] = items
      .filter(isFolder)
      .map((folder) => ({
        id: folder.id,
        group: 'folders',
        breadcrumbs: [
          formatMessage(projectsMessages.folders),
          localize(folder.attributes.title_multiloc),
        ],
        link: {
          to: '/admin/projects/folders/$projectFolderId',
          params: { projectFolderId: folder.id },
        },
      }));

    const projects = items.filter(isProject);

    const projectEntries: QuickSearchEntry[] = [];
    const phaseEntries: QuickSearchEntry[] = [];
    projects.forEach((project) => {
      const folderTitle = project.attributes.folder_title_multiloc;
      const breadcrumbs = [
        projectsLabel,
        ...(folderTitle ? [localize(folderTitle)] : []),
        localize(project.attributes.title_multiloc),
      ];

      projectEntries.push({
        id: project.id,
        group: 'projects',
        breadcrumbs,
        link: {
          to: '/admin/projects/$projectId',
          params: { projectId: project.id },
        },
      });

      project.attributes.phases.forEach((phase) => {
        phaseEntries.push({
          id: phase.id,
          group: 'phases',
          breadcrumbs: [...breadcrumbs, localize(phase.title_multiloc)],
          link: {
            to: '/admin/projects/$projectId/phases/$phaseId',
            params: { projectId: project.id, phaseId: phase.id },
          },
        });
      });
    });

    return [
      ...pageEntries,
      ...spaceEntries,
      ...folderEntries,
      ...projectEntries,
      ...phaseEntries,
    ];
  }, [data, authUser, appConfiguration, formatMessage, localize]);
};

export default useQuickSearchEntries;
