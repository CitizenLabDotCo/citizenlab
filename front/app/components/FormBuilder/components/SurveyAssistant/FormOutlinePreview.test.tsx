import React from 'react';

import { render, screen } from 'utils/testUtils/rtl';

import FormOutlinePreview from './FormOutlinePreview';

describe('FormOutlinePreview', () => {
  it('outlines the proposed pages and questions', () => {
    render(
      <FormOutlinePreview
        args={{
          fields: [
            { input_type: 'page', title_multiloc: { en: 'Your park' } },
            {
              id: 'field-1',
              input_type: 'select',
              title_multiloc: { en: 'How often do you visit?' },
              required: true,
            },
            { input_type: 'page', key: 'form_end', title_multiloc: {} },
          ],
        }}
      />
    );

    expect(screen.getByText('1 page, 1 question')).toBeInTheDocument();
    expect(screen.getByText('Your park')).toBeInTheDocument();
    expect(screen.getByText('How often do you visit?')).toBeInTheDocument();
    expect(screen.getByText('End page')).toBeInTheDocument();
  });

  it('ignores malformed arguments', () => {
    render(
      <FormOutlinePreview
        args={{ fields: [{ input_type: 'nonsense' }, 'not a field', null] }}
      />
    );

    expect(screen.getByText('0 pages, 0 questions')).toBeInTheDocument();
  });
});
