import { ProjectMiniAdminData } from 'api/projects_mini_admin/types';

import toGanttItem from './toGanttItem';

const localize = (multiloc?: Record<string, string> | null) =>
  multiloc?.en ?? '';

const project = (
  attributes: Partial<ProjectMiniAdminData['attributes']>
): ProjectMiniAdminData => ({
  id: 'p1',
  type: 'project_mini_admin',
  attributes: {
    active_phases_start_date: '2026-03-01',
    active_phases_end_date: '2026-04-01',
    admin_publication_id: 'pub-1',
    ordering: 0,
    display_status: 'published',
    highlighted_phase: null,
    first_phase_start_date: '2026-01-01',
    first_published_at: null,
    folder_title_multiloc: null,
    space_title_multiloc: null,
    last_phase_end_date: '2026-06-30',
    listed: true,
    publication_status: 'published',
    scheduled_at: null,
    title_multiloc: { en: 'Night bus network' },
    visible_to: 'public',
    ...attributes,
  },
  relationships: {
    project_images: { data: [] },
    groups: { data: [] },
    moderators: { data: [] },
  },
});

describe('toGanttItem', () => {
  it('spans the project from its first phase to its last', () => {
    expect(toGanttItem(project({}), localize)).toMatchObject({
      id: 'p1',
      title: 'Night bus network',
      start: '2026-01-01',
      end: '2026-06-30',
      highlight: { start: '2026-03-01', end: '2026-04-01' },
      icon: undefined,
    });
  });

  it('marks a project in a folder', () => {
    const inFolder = project({ folder_title_multiloc: { en: 'Mobility' } });
    expect(toGanttItem(inFolder, localize)).toMatchObject({
      folder: 'Mobility',
      icon: 'folder-solid',
    });
  });
});
