import React from 'react';

import { screen, render } from 'utils/testUtils/rtl';

import ProjectFolderForm from '.';

jest.mock('hooks/useAppConfigurationLocales', () => jest.fn(() => ['en']));
jest.mock('hooks/useFeatureFlag', () => jest.fn(() => true));

describe('ProjectFolderForm', () => {
  describe('when creating a folder (new mode)', () => {
    it('does not render a description editor — the description is added in the Content Builder after creation', () => {
      render(<ProjectFolderForm mode="new" />);

      // No inline WYSIWYG editor and no Content Builder link at creation time:
      // the folder is created first, then its description is authored in the
      // Content Builder.
      expect(
        screen.queryByText('Edit description in Content Builder')
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId('descriptionBuilderLink')
      ).not.toBeInTheDocument();
    });

    it('still renders the folder title field', () => {
      render(<ProjectFolderForm mode="new" />);

      expect(screen.getAllByRole('textbox').length).toBeGreaterThan(0);
    });
  });
});
