import ideasKeys from 'api/ideas/keys';
import { fetchIdea } from 'api/ideas/useIdeaBySlug';
import getProjectbySlug from 'api/projects/getProjectBySlug';

import { queryClient } from 'utils/cl-react-query/queryClient';

const projectPathRegex =
  /(\/(?<prefix_segment>[^/]+))?\/projects\/(?<slug_or_id>[^/?#]+)/;
const ideasPathRegex = /\/ideas\/(?<slug>[^/?#]+)/;

const getProjectIdFromProjectSlug = async (slug: string) => {
  try {
    const project = await getProjectbySlug(slug);
    return project.data.id;
  } catch {
    return null;
  }
};

async function extractProjectIdFromProjectPath(path: string) {
  const match = path.match(projectPathRegex);

  if (match?.groups) {
    const slugOrId = match.groups.slug_or_id;
    const prefix = match.groups.prefix_segment;
    return prefix === 'admin'
      ? slugOrId
      : await getProjectIdFromProjectSlug(slugOrId);
  } else {
    return null;
  }
}

async function getIdea(slug: string) {
  return queryClient.fetchQuery(ideasKeys.item({ slug }), () =>
    fetchIdea({ slug })
  );
}

async function getProjectIdFromIdeaSlug(slug: string) {
  const idea = await getIdea(slug);
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  return idea?.data.relationships?.project?.data?.id;
}

async function extractProjectIdFromIdeaPath(path: string) {
  const slug = path.match(ideasPathRegex)?.groups?.slug;
  return slug ? await getProjectIdFromIdeaSlug(slug) : null;
}

export const getProjectId = async (path: string) => {
  return (
    (await extractProjectIdFromProjectPath(path)) ||
    (await extractProjectIdFromIdeaPath(path))
  );
};
