import React from 'react';
import { render, screen } from 'utils/testUtils/rtl';

import ProjectFolderSelect from './';

jest.mock('services/appConfiguration');
jest.mock('utils/cl-intl');
jest.mock('hooks/useLocalize');
jest.mock('hooks/useAuthUser');

describe('ProjectFolderSelect', () => {
  it('should render', () => {
    render(
      <ProjectFolderSelect
        projectAttrs={{ folder_id: 'folderId' }}
        onProjectAttributesDiffChange={jest.fn()}
      />
    );
  });

  expect(screen.getByTestId('projectFolderSelect')).toBeInTheDocument();
});
