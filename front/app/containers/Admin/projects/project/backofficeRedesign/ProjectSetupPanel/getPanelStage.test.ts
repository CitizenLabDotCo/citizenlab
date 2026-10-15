import { project1 } from 'api/projects/__mocks__/_mockServer';
import { IProjectAttributes, IProjectData } from 'api/projects/types';

import getPanelStage from './getPanelStage';

const withAttributes = (
  attributes: Partial<IProjectAttributes>
): IProjectData => ({
  ...project1,
  attributes: { ...project1.attributes, ...attributes },
});

describe('getPanelStage', () => {
  it('is draft for draft projects, scheduled or not', () => {
    expect(getPanelStage(withAttributes({ publication_status: 'draft' }))).toBe(
      'draft'
    );
    expect(
      getPanelStage(
        withAttributes({
          publication_status: 'draft',
          scheduled_at: '2030-01-01T10:00:00Z',
        })
      )
    ).toBe('draft');
  });

  it('is live while published, whatever its phases', () => {
    (['active', 'upcoming', 'ended', null] as const).forEach(
      (participation_status) => {
        expect(
          getPanelStage(
            withAttributes({
              publication_status: 'published',
              participation_status,
            })
          )
        ).toBe('live');
      }
    );
  });

  it('is archived for archived projects, whatever their phases', () => {
    expect(
      getPanelStage(
        withAttributes({
          publication_status: 'archived',
          participation_status: 'active',
        })
      )
    ).toBe('archived');
  });
});
