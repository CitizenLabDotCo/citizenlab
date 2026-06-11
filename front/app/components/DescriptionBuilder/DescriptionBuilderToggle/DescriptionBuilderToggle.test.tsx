import React from 'react';

import { useParams } from '@tanstack/react-router';
import { Multiloc } from 'typings';

import { render, screen } from 'utils/testUtils/rtl';

import DescriptionBuilderToggle from '.';

const DEFAULT_DESCRIPTION_BUILDER_LAYOUT_DATA = {
  data: {
    attributes: {
      enabled: false,
    },
  },
};

const mockDescriptionBuilderLayoutData: typeof DEFAULT_DESCRIPTION_BUILDER_LAYOUT_DATA =
  DEFAULT_DESCRIPTION_BUILDER_LAYOUT_DATA;

jest.mock('api/content_builder/useContentBuilderLayout', () => () => {
  return {
    data: mockDescriptionBuilderLayoutData,
  };
});

const mockAddDescriptionBuilderLayout = jest.fn();
jest.mock('api/content_builder/useAddContentBuilderLayout', () =>
  jest.fn(() => ({ mutateAsync: mockAddDescriptionBuilderLayout }))
);

(useParams as jest.Mock).mockReturnValue({ projectId: 'projectId' });

const dummyFunction = jest.fn();
const multiloc = { en: 'content' } as Multiloc;

let mockFeatureFlagData = true;
jest.mock('hooks/useFeatureFlag', () => jest.fn(() => mockFeatureFlagData));

describe('DescriptionBuilderToggle', () => {
  beforeEach(() => {
    mockFeatureFlagData = true;
  });

  it('shows only the Content Builder link for projects — no toggle, no WYSIWYG editor', () => {
    render(
      <DescriptionBuilderToggle
        valueMultiloc={multiloc}
        onChange={dummyFunction}
        label={'QuillLabel'}
        contentBuildableType="project"
      />
    );
    expect(
      screen.getByText('Edit description in Content Builder')
    ).toBeInTheDocument();
    // The builder-vs-WYSIWYG toggle and the inline Quill editor are gone.
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    expect(screen.queryByText('QuillLabel')).not.toBeInTheDocument();
    expect(mockAddDescriptionBuilderLayout).not.toHaveBeenCalled();
  });

  it('does not render component when feature flag is not active', () => {
    mockFeatureFlagData = false;
    render(
      <DescriptionBuilderToggle
        valueMultiloc={multiloc}
        onChange={dummyFunction}
        label={'QuillLabel'}
        contentBuildableType="project"
      />
    );
    expect(
      screen.queryByTestId('descriptionBuilderToggle')
    ).not.toBeInTheDocument();
  });
});
