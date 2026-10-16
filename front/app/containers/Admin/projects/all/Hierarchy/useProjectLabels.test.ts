import {
  HighlightedPhase,
  ProjectMiniAdminData,
} from 'api/projects_mini_admin/types';

import { renderHook } from 'utils/testUtils/rtl';

import useProjectLabels from './useProjectLabels';

const project = (
  highlighted_phase: HighlightedPhase | null
): ProjectMiniAdminData => ({
  id: 'p1',
  type: 'project_mini_admin',
  attributes: {
    active_phases_start_date: null,
    active_phases_end_date: null,
    display_status: 'published',
    highlighted_phase,
    first_phase_start_date: null,
    first_published_at: null,
    folder_title_multiloc: null,
    space_title_multiloc: null,
    last_phase_end_date: null,
    listed: true,
    publication_status: 'published',
    admin_publication_id: 'ap1',
    ordering: 0,
    scheduled_at: null,
    title_multiloc: { en: 'Bikes' },
    visible_to: 'public',
  },
  relationships: {
    project_images: { data: [] },
    groups: { data: [] },
    moderators: { data: [] },
  },
});

const labelsOf = (phase: HighlightedPhase | null) =>
  renderHook(() => useProjectLabels(project(phase))).result.current;

describe('useProjectLabels', () => {
  it('says when the open phase ends', () => {
    const labels = labelsOf({
      participation_method: 'voting',
      status: 'active',
      start_at: '2026-10-01',
      end_at: '2026-10-19',
    });

    expect(labels.status).toBe('Live');
    expect(labels.method).toBe('Voting');
    expect(labels.when).toMatch(/^open until .*19/);
  });

  it('says a phase without an end is open', () => {
    expect(
      labelsOf({
        participation_method: 'ideation',
        status: 'active',
        start_at: '2026-10-01',
        end_at: null,
      }).when
    ).toBe('open');
  });

  it('says when the next phase starts', () => {
    const labels = labelsOf({
      participation_method: 'ideation',
      status: 'upcoming',
      start_at: '2027-01-12',
      end_at: null,
    });

    expect(labels.method).toBe('Ideation');
    expect(labels.when).toMatch(/^starts .*12/);
  });

  it('says the last phase ended', () => {
    expect(
      labelsOf({
        participation_method: 'voting',
        status: 'ended',
        start_at: '2026-01-01',
        end_at: '2026-02-01',
      }).when
    ).toBe('ended');
  });

  it('has no method and says so without phases', () => {
    const labels = labelsOf(null);

    expect(labels.method).toBeUndefined();
    expect(labels.when).toBe('No phases yet');
  });
});
