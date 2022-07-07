import React from 'react';
import { render, screen } from 'utils/testUtils/rtl';
import ContentBuilderPreview from './';

let mockFeatureFlagData = true;

jest.mock('services/locale');
jest.mock('utils/cl-router/withRouter', () => {
  return {
    withRouter: (Component) => {
      return (props) => {
        return <Component {...props} params={{ slug: 'slug' }} />;
      };
    },
  };
});
jest.mock('utils/cl-router/Link');

jest.mock('hooks/useFeatureFlag', () => jest.fn(() => mockFeatureFlagData));

jest.mock('hooks/useProject', () => {
  return jest.fn(() => ({
    id: '2',
    type: 'project',
    attributes: {
      title_multiloc: { en: 'Test Project' },
      slug: 'test',
    },
  }));
});

describe('ContentBuilderPreview', () => {
  it('calls onMount correctly and renders component when feature flag is enabled', () => {
    const onMount = jest.fn();
    render(<ContentBuilderPreview onMount={onMount} />);

    expect(onMount).toHaveBeenCalled();
    expect(screen.getByTestId('contentBuilderPreview')).toBeInTheDocument();
  });

  it('does not call onMount and does not render component when feature flag is disabled', () => {
    mockFeatureFlagData = false;
    const onMount = jest.fn();
    render(<ContentBuilderPreview onMount={onMount} />);

    expect(onMount).not.toHaveBeenCalled();
    expect(
      screen.queryByTestId('contentBuilderPreview')
    ).not.toBeInTheDocument();
  });
});
