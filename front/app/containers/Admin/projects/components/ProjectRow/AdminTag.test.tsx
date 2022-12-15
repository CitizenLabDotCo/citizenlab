import * as React from 'react';
import { render, screen } from 'utils/testUtils/rtl';
import AdminTag from './AdminTag';

jest.mock('utils/cl-router/Link');
jest.mock('utils/cl-intl');
const projectId = '1';

describe('AdminTag', () => {
  it('renders AdminTag component', () => {
    render(<AdminTag projectId={projectId} userCanModerateProject={true} />);

    expect(screen.getByText('Only admins can view')).toBeInTheDocument();
  });

  it('links to the projects permissions if the user has permission', () => {
    render(<AdminTag projectId={projectId} userCanModerateProject={true} />);

    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      `/en/admin/projects/${projectId}/permissions`
    );
  });

  it('does not link to the projects permissions if the user has no permission', () => {
    render(<AdminTag projectId={projectId} userCanModerateProject={false} />);

    expect(screen.queryByRole('link')).toBeNull();
  });
});
