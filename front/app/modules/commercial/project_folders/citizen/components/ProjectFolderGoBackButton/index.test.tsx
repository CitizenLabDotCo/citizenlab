import React from 'react';
import { render, screen, fireEvent } from 'utils/testUtils/rtl';

import GoBackButton from './';

const projectFolderData = {
  id: 'a8735d6f-cdd4-4242-8531-b089b5e3954a',
  type: 'folder',
  attributes: {
    title_multiloc: {
      en: 'TestFolder',
      'fr-BE': 'Le folder du test',
      'nl-BE': 'TestMap',
    },
    slug: 'testfolder',
  },
};

let historyState: string;
const history = {
  push(location: string) {
    historyState = location;
  },
};

jest.mock('utils/cl-router/history', () => history);
jest.mock('../../../hooks/useProjectFolder', () =>
  jest.fn(() => projectFolderData)
);
jest.mock('hooks/useLocale', () => jest.fn(() => 'en'));
jest.mock('hooks/useLocalize', () => jest.fn(() => (multiloc) => multiloc.en));

describe('GoBackButton', () => {
  it('should render', () => {
    render(<GoBackButton projectFolderId={projectFolderData.id} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('TestFolder')).toBeInTheDocument();
  });
  it('pushes parent folder path to history when clicked', () => {
    render(<GoBackButton projectFolderId={projectFolderData.id} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(historyState).toBe('/folders/testfolder');
  });
});
