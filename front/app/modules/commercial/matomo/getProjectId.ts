// services
import { projectBySlugStream, IProject } from 'services/projects';
import { ideaBySlugStream, IIdea } from 'services/ideas';

// utils
import { slugRegEx } from 'utils/textUtils';
import { isNilOrError, NilOrError } from 'utils/helperUtils';

// typings
import { Subscription } from 'rxjs';

export const getProjectId = async (path: string) => {
  if (isProjectPage(path)) {
    const slug = extractProjectSlug(path);
    if (!slug) return null;

    const projectId = await getProjectIdFromProjectSlug(slug);
    if (projectSubscriptions[slug]) {
      projectSubscriptions[slug].unsubscribe();
    }
    delete projectSubscriptions[slug];

    return projectId;
  }

  if (isIdeaPage(path)) {
    const slug = extractIdeaSlug(path);
    if (!slug) return null;

    const projectId = await getProjectIdFromIdeaSlug(slug);
    ideaSubscriptions[slug].unsubscribe();
    delete ideaSubscriptions[slug];

    return projectId;
  }

  return null;
};
const slugRegExSource = slugRegEx.source.slice(1, slugRegEx.source.length - 2);

const projectPageDetectRegex = RegExp(`/projects/(${slugRegExSource})`);
const projectPageExtractRegex = /\/projects\/([^\s!?/.*#|]+)/;

const isProjectPage = (path: string) => {
  return projectPageDetectRegex.test(path);
};

const extractProjectSlug = (path: string) => {
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

const ideaSubscriptions: Record<string, Subscription> = {};

const getProjectIdFromIdeaSlug = (slug: string): Promise<string | null> => {
  return new Promise((resolve) => {
    const observable = ideaBySlugStream(slug).observable;

    ideaSubscriptions[slug] = observable.subscribe(
      (idea: IIdea | NilOrError) => {
        if (isNilOrError(idea)) {
          resolve(null);
        } else {
          resolve(idea.data.relationships.project.data.id);
        }
      }
    );
  });
};
