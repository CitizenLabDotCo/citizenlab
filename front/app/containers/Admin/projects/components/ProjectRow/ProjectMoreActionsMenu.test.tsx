import React from 'react';
import ProjectMoreActionsMenu, { Props } from './ProjectMoreActionsMenu';
import { render, screen, userEvent } from 'utils/testUtils/rtl';

const props: Props = {
  projectId: 'projectId',
  setError: jest.fn(),
};

// Needed to render moreActionsMenu
jest.mock('hooks/useAuthUser', () => {
  return () => ({
    id: 'userId',
  });
});

describe('ProjectMoreActionsMenu', () => {
  it('Has the buttons to copy and delete projects', async () => {
    const user = userEvent.setup();
    render(<ProjectMoreActionsMenu {...props} />);
    const threeDotsButton = screen.getByTestId('moreOptionsButton');
    await user.click(threeDotsButton);

    const copyProjectButton = await screen.findByRole('button', {
      name: 'Copy project',
    });
    const deleteProjectButton = await screen.findByRole('button', {
      name: 'Delete project',
    });

    expect(copyProjectButton).toBeInTheDocument();
    expect(deleteProjectButton).toBeInTheDocument();
  });
});
