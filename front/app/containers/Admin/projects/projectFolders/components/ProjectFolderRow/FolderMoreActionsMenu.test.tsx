import React from 'react';
import FolderMoreActionsMenu, { Props } from './FolderMoreActionsMenu';
import { render, screen, userEvent } from 'utils/testUtils/rtl';

const props: Props = {
  folderId: 'folderId',
  setError: jest.fn(),
};

// Needed to render moreActionsMenu
jest.mock('hooks/useAuthUser', () => {
  return () => ({
    id: 'userId',
  });
});

describe('FolderMoreActionsMenu', () => {
  it('Has the buttons to copy and delete projects', async () => {
    const user = userEvent.setup();
    render(<FolderMoreActionsMenu {...props} />);
    const threeDotsButton = screen.getByTestId('moreOptionsButton');
    await user.click(threeDotsButton);

    const deleteProjectButton = await screen.findByRole('button', {
      name: 'Delete project',
    });

    expect(deleteProjectButton).toBeInTheDocument();
  });
});
