import React from 'react';

import { useParams } from '@tanstack/react-router';
import { Multiloc } from 'typings';

import { render, screen } from 'utils/testUtils/rtl';

import DescriptionBuilderToggle from '.';

let mockDescriptionBuilderLayoutData:
  | { data: { attributes: { enabled: boolean } } }
  | undefined;

jest.mock('api/content_builder/useContentBuilderLayout', () => () => ({
  data: mockDescriptionBuilderLayoutData,
}));

const mockAddDescriptionBuilderLayout = jest.fn();
jest.mock('api/content_builder/useAddContentBuilderLayout', () =>
  jest.fn(() => ({ mutateAsync: mockAddDescriptionBuilderLayout }))
);

(useParams as jest.Mock).mockReturnValue({ projectId: 'projectId' });

const dummyFunction = jest.fn();
const multiloc = { en: 'content' } as Multiloc;

let mockFeatureFlagData = true;
jest.mock('hooks/useFeatureFlag', () => jest.fn(() => mockFeatureFlagData));

const renderToggle = (contentBuildableType: 'project' | 'folder' = 'project') =>
  render(
    <DescriptionBuilderToggle
      valueMultiloc={multiloc}
      onChange={dummyFunction}
      label={'QuillLabel'}
      contentBuildableType={contentBuildableType}
    />
  );

describe('DescriptionBuilderToggle', () => {
  beforeEach(() => {
    mockFeatureFlagData = true;
    mockDescriptionBuilderLayoutData = undefined;
    mockAddDescriptionBuilderLayout.mockClear();
  });

  it('shows the WYSIWYG editor and an unlocked toggle when the description is not on the Content Builder', () => {
    mockDescriptionBuilderLayoutData = {
      data: { attributes: { enabled: false } },
    };
    renderToggle();

    const toggle = screen.getByRole('checkbox');
    expect(toggle).not.toBeChecked();
    expect(toggle).toBeEnabled();
    expect(screen.getByText('QuillLabel')).toBeInTheDocument();
    expect(
      screen.queryByText('Edit description in Content Builder')
    ).not.toBeInTheDocument();
  });

  it('enables the Content Builder layout when the toggle is switched on', () => {
    mockDescriptionBuilderLayoutData = {
      data: { attributes: { enabled: false } },
    };
    renderToggle();

    screen.getByRole('checkbox').click();

    expect(mockAddDescriptionBuilderLayout).toHaveBeenCalledWith({
      contentBuildableId: 'projectId',
      contentBuildableType: 'project',
      enabled: true,
    });
  });

  it('locks the toggle on and shows only the Content Builder link once the description is on the Content Builder', () => {
    mockDescriptionBuilderLayoutData = {
      data: { attributes: { enabled: true } },
    };
    renderToggle();

    const toggle = screen.getByRole('checkbox');
    expect(toggle).toBeChecked();
    expect(toggle).toBeDisabled();
    expect(
      screen.getByText('Edit description in Content Builder')
    ).toBeInTheDocument();
    expect(screen.queryByText('QuillLabel')).not.toBeInTheDocument();
  });

  it('does not render component when feature flag is not active', () => {
    mockFeatureFlagData = false;
    renderToggle();
    expect(
      screen.queryByTestId('descriptionBuilderToggle')
    ).not.toBeInTheDocument();
  });
});
