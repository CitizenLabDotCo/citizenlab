import React from 'react';

import { BuilderCanvasContext } from 'components/admin/ContentBuilder/context/BuilderCanvasContext';

import { render, screen } from 'utils/testUtils/rtl';

import messages from '../Selection/messages';

import EmptyState from './EmptyState';

describe('EmptyState', () => {
  it('shows the title and the explanation inside a builder canvas', () => {
    render(
      <BuilderCanvasContext.Provider value={true}>
        <EmptyState
          title="Selected projects and folders"
          explanation={messages.noData}
        />
      </BuilderCanvasContext.Provider>
    );

    expect(
      screen.getByText('Selected projects and folders')
    ).toBeInTheDocument();
    expect(
      screen.getByText('No projects or folders selected')
    ).toBeInTheDocument();
  });

  it('renders nothing outside a builder canvas', () => {
    render(
      <EmptyState
        title="Selected projects and folders"
        explanation={messages.noData}
      />
    );

    expect(
      screen.queryByText('Selected projects and folders')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('No projects or folders selected')
    ).not.toBeInTheDocument();
  });
});
