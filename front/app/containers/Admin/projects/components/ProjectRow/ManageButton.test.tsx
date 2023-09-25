import * as React from 'react';
import { render, screen } from 'utils/testUtils/rtl';
import ManageButton from './ManageButton';

jest.mock('utils/cl-router/Link');
jest.mock('utils/locale');
const projectId = '1';

describe('ManageButton', () => {
  it('links to the project page with the publicationId in the URL', () => {
    render(<ManageButton publicationId={projectId} isDisabled={false} />);

    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      `/en/admin/projects/${projectId}`
    );
  });
});
