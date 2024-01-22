import * as React from 'react';
import { render, screen } from 'utils/testUtils/rtl';
import GroupsTag from './GroupsTag';

const projectGroups = [{ id: 'projectGroup1' }, { id: 'projectGroup2' }];

jest.mock('api/project_groups/useProjectGroups', () =>
  jest.fn(() => ({ data: { data: projectGroups } }))
);
const projectId = '1';

describe('GroupsTag', () => {
  it('renders', () => {
    render(<GroupsTag projectId={projectId} userCanModerateProject={true} />);

    expect(screen.getByText('2 groups can view')).toBeInTheDocument();
  });

  it('does not link to the projects permissions if the user has no permission', () => {
    render(<GroupsTag projectId={projectId} userCanModerateProject={false} />);

    expect(screen.queryByRole('link')).toBeNull();
  });
});
