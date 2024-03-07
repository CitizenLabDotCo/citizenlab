import * as React from 'react';
import { render, screen } from 'utils/testUtils/rtl';
import AdminTag from './AdminTag';

const projectId = '1';

describe('AdminTag', () => {
  it('renders AdminTag component', () => {
    render(<AdminTag projectId={projectId} userCanModerateProject={true} />);

    expect(screen.getByText('Only admins can view')).toBeInTheDocument();
  });

  it('does not link to the projects permissions if the user has no permission', () => {
    render(<AdminTag projectId={projectId} userCanModerateProject={false} />);

    expect(screen.queryByRole('link')).toBeNull();
  });
});
