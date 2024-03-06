import React from 'react';

import { render, fireEvent, screen, waitFor } from 'utils/testUtils/rtl';

import CreateTokenModal from './CreateTokenModal';

const mockMutate = jest.fn(() =>
  Promise.resolve({
    data: {
      attributes: {
        secret: 'secret',
      },
    },
  })
);

jest.mock('api/api_clients/useAddApiClient', () =>
  jest.fn(() => ({ mutateAsync: mockMutate, reset: jest.fn() }))
);

describe('<CreateTokenModal />', () => {
  it('submits form correctly', async () => {
    render(<CreateTokenModal onClose={jest.fn()} />);

    fireEvent.change(screen.getByRole('textbox'), {
      target: {
        value: 'name',
      },
    });

    fireEvent.click(screen.getByText('Create new token'));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({
        name: 'name',
      });
      // Displays the success screen correctly
      expect(screen.getByTestId('tokenCreateSuccess')).toBeInTheDocument();
      expect(screen.getByText('secret')).toBeInTheDocument();
    });
  });
});
