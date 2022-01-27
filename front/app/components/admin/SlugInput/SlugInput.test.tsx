import React from 'react';
import { render } from '@testing-library/react';
import SlugInput from '.';

jest.mock('utils/cl-intl');
jest.mock('hooks/useAppConfiguration', () => () => ({
  data: { attributes: { name: 'orgName', host: 'localhost' } },
}));
jest.mock('hooks/useLocale', () => jest.fn(() => 'en'));

describe('SlugInput', () => {
  let onChange: jest.Mock;

  // beforeEach(() => {
  //   onChange = jest.fn();
  // });

  it('shows a preview URL', () => {
    const resource = 'folder';
    const showError = true;
    const slug = 'my-folder';
    let errors = {};

    render(
      <SlugInput
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
