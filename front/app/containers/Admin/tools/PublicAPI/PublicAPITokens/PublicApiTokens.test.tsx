import React from 'react';

import { data } from 'api/api_clients/__mocks__/useApiClients';

import { render, screen, userEvent } from 'utils/testUtils/rtl';

import PublicApiTokens from './';

const mockData = data;

jest.mock('api/api_clients/useApiClients', () =>
  jest.fn(() => ({ data: mockData }))
);
describe('<PublicApiTokens />', () => {
  it('renders component', () => {
    render(<PublicApiTokens />);
    expect(screen.getByText('Public API tokens')).toBeInTheDocument();
  });

  it('renders component with data', () => {
    render(<PublicApiTokens />);
    expect(screen.getByTestId('apiTokensTable')).toBeInTheDocument();
    expect(screen.getByText('Test token')).toBeInTheDocument();
    expect(screen.getByText('3/18/2021')).toBeInTheDocument();
    expect(screen.getByText('3/19/2021')).toBeInTheDocument();
  });

  it('shows the user agent of the last call when hovering the last used date', async () => {
    render(<PublicApiTokens />);

    await userEvent.hover(screen.getByText('3/19/2021'));

    expect(
      await screen.findByText(/Last user agent: Microsoft.Data.Mashup/)
    ).toBeInTheDocument();
  });

  it('renders empty state correctly', () => {
    mockData.data = [];
    render(<PublicApiTokens />);
    expect(
      screen.getByText('You do not have any tokens yet.')
    ).toBeInTheDocument();
  });
});
