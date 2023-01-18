import React from 'react';
import { render, screen } from '@testing-library/react';
import HeaderImage from './HeaderImage';
import { mockHomepageSettings } from 'services/__mocks__/homepageSettings';
import { getTheme } from '@citizenlab/cl2-component-library';
import * as styledComponents from 'styled-components';

jest.mock('hooks/useHomepageSettings', () => {
  return jest.fn(() => mockHomepageSettings());
});
jest.spyOn(styledComponents, 'useTheme').mockReturnValue(getTheme());

describe('HeaderImage', () => {
  it('has the right opacity', () => {
    render(<HeaderImage />);
    expect(screen.getByTestId('signed-in-header-image-container')).toHaveStyle(
      'opacity: 1'
    );
  });
});
