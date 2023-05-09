// services
import { projectBySlugStream } from 'services/projects';

// utils
import { slugRegEx } from 'utils/textUtils';
import { isNilOrError, NilOrError } from 'utils/helperUtils';

// typings
import { Subscription } from 'rxjs';
import { queryClient } from 'utils/cl-react-query/queryClient';
import ideasKeys from 'api/ideas/keys';
import { fetchIdea } from 'api/ideas/useIdeaBySlug';
import { IProject } from 'api/projects/types';

export const getProjectId = async (path: string) => {
  if (isProjectPage(path)) {
    // We are using an id in the admin and a slug for citizens
    if (isOnAdminProjectPage(path)) {
      return extractProjectIdOrSlug(path);
    } else {
      const slug = extractProjectIdOrSlug(path);
      if (!slug) return null;

      const projectId = await getProjectIdFromProjectSlug(slug);
      if (projectSubscriptions[slug]) {
        projectSubscriptions[slug].unsubscribe();
      }
      delete projectSubscriptions[slug];

      return projectId;
    }
  }

  if (isIdeaPage(path)) {
    const slug = extractIdeaSlug(path);
    if (!slug) return null;

    const idea = await getIdea(slug);
    const projectId = idea?.data.relationships?.project?.data?.id;
    return projectId;
  }

  return null;
};
const slugRegExSource = slugRegEx.source.slice(1, slugRegEx.source.length - 2);

const adminProjectPageDetectRegex = RegExp(
  `admin/projects/(${slugRegExSource})`
);
const projectPageDetectRegex = RegExp(`/projects/(${slugRegExSource})`);
const projectPageExtractRegex = /\/projects\/([^\s!?/.*#|]+)/;

const isProjectPage = (path: string) => {
  return projectPageDetectRegex.test(path);
};

export const isOnAdminProjectPage = (path: string) => {
  return adminProjectPageDetectRegex.test(path);
};

const extractProjectIdOrSlug = (path: string) => {
  const matches = path.match(projectPageExtractRegex);
  return matches && matches[1];
};

const projectSubscriptions: Record<string, Subscription> = {};

const getProjectIdFromProjectSlug = (slug: string): Promise<string | null> => {
  return new Promise((resolve) => {
    const observable = projectBySlugStream(slug).observable;

    projectSubscriptions[slug] = observable.subscribe(
      (project: IProject | NilOrError) => {
        if (isNilOrError(project)) {
          resolve(null);
        } else {
          resolve(project.data.id);
        }
      }
    );
  });
};

const ideaPageDetectRegex = RegExp(`/ideas/(${slugRegExSource})$`);
const ideaPageExtractRegex = /\/ideas\/([^\s!?/.*#|]+)$/;

const isIdeaPage = (path: string) => {
  return ideaPageDetectRegex.test(path);
};

export const extractIdeaSlug = (path: string) => {
  const ideaPageMatches = path.match(ideaPageExtractRegex);
  return ideaPageMatches && ideaPageMatches[1];
};

const getIdea = async (slug: string) => {
  return queryClient.fetchQuery(ideasKeys.item({ slug }), () =>
    fetchIdea({ slug })
  );
};
