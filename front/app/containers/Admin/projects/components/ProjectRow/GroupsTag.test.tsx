import * as React from 'react';
import { render, screen } from 'utils/testUtils/rtl';
import GroupsTag from './GroupsTag';

jest.mock('utils/cl-router/Link');
jest.mock('utils/cl-intl');

const projectGroups = {
  projectGroups: [{ id: 'projectGroup1' }, { id: 'projectGroup2' }],
};
jest.mock('hooks/useProjectGroups', () => jest.fn(() => projectGroups));
const projectId = '1';

describe('GroupsTag', () => {
  it('renders', () => {
    render(<GroupsTag projectId={projectId} userCanModerateProject={true} />);

    expect(screen.getByText('Only admins can view')).toBeInTheDocument();
  });

  it('links to the projects permissions if the user has permission', () => {
    render(<GroupsTag projectId={projectId} userCanModerateProject={true} />);

    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      `/en/admin/projects/${projectId}/permissions`
    );
  });

  it('does not link to the projects permissions if the user has no permission', () => {
    render(<GroupsTag projectId={projectId} userCanModerateProject={false} />);

    expect(screen.queryByRole('link')).toBeNull();
  });
});
