import { useEffect, useMemo } from 'react';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useAuthUser from 'api/me/useAuthUser';
import { IPhaseData } from 'api/phases/types';
import useInfiniteProjectsMiniAdmin from 'api/projects_mini_admin/useInfiniteProjectsMiniAdmin';

import { areFeaturesActive } from 'hooks/useFeatureFlags';
import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';
import { hasPermission } from 'utils/permissions';

import sidebarMessages from '../messages';

import { QuickSearchEntry } from './filterEntries';
import staticEntries from './staticEntries';

const PAGE_SIZE = 250;

const isPhase = (item: { type: string }): item is IPhaseData =>
  item.type === 'phase';

const useQuickSearchEntries = () => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { data: authUser } = useAuthUser();
  const { data: appConfiguration } = useAppConfiguration();

  // The endpoint only returns projects the current user can manage, so
  // moderators only get their own projects and phases.
  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useInfiniteProjectsMiniAdmin({ sort: 'alphabetically_asc' }, PAGE_SIZE);

  // Search needs the full list, so keep loading pages until there are none left.
  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

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

    const pages = data?.pages ?? [];
    const projects = pages.flatMap((page) => page.data);
    const projectsLabel = formatMessage(sidebarMessages.projects);
    const projectBreadcrumbs = new Map(
      projects.map((project) => {
        const folderTitle = project.attributes.folder_title_multiloc;
        return [
          project.id,
          [
            projectsLabel,
            ...(folderTitle ? [localize(folderTitle)] : []),
            localize(project.attributes.title_multiloc),
          ],
        ];
      })
    );

    const projectEntries: QuickSearchEntry[] = projects.map((project) => ({
      id: project.id,
      group: 'projects',
      breadcrumbs: projectBreadcrumbs.get(project.id) ?? [],
      link: {
        to: '/admin/projects/$projectId',
        params: { projectId: project.id },
      },
    }));

    const phaseEntries: QuickSearchEntry[] = pages
      .flatMap((page) => page.included ?? [])
      .filter(isPhase)
      .map((phase) => {
        const projectId = phase.relationships.project.data.id;
        return {
          id: phase.id,
          group: 'phases',
          breadcrumbs: [
            ...(projectBreadcrumbs.get(projectId) ?? []),
            localize(phase.attributes.title_multiloc),
          ],
          link: {
            to: '/admin/projects/$projectId/phases/$phaseId',
            params: { projectId, phaseId: phase.id },
          },
        };
      });

    return [...pageEntries, ...projectEntries, ...phaseEntries];
  }, [data, authUser, appConfiguration, formatMessage, localize]);
};

export default useQuickSearchEntries;
