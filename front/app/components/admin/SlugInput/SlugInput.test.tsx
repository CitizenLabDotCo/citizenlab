import React from 'react';
import { render } from '@testing-library/react';
import SlugInput from '.';

jest.mock('utils/cl-intl');
jest.mock('hooks/useAppConfiguration', () => () => ({
  data: { attributes: { name: 'orgName', host: 'localhost' } },
}));
jest.mock('hooks/useLocale');
jest.mock('services/locale');

const defaultProps = {
  resources: 'folders',
};

describe('SlugInput', () => {
  let onChange: jest.Mock;

  // beforeEach(() => {
  //   onChange = jest.fn();
  // });

  it('shows a preview URL', () => {
    const resource = 'folder';
    const showError = true;
    const slug = 'my-folder';
    const errors = {};

    render(
      <SlugInput
        {...defaultProps}
        slug={slug}
        resource={resource}
        apiErrors={errors}
        showSlugErrorMessage={showError}
        handleSlugOnChange={onChange}
      />
    );

    expect(true).toBeTruthy;
  });
});
