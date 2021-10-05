import React from 'react';
import { render, screen } from 'utils/testUtils/rtl';
import PageList from './index';

jest.mock('services/locale');
jest.mock('services/appConfiguration');

const generatePagesData = (length: number) => {
  return Array(length)
    .fill(0)
    .map((_, i) => ({
      id: `_${i}`,
      attributes: {
        title_multiloc: { en: `English title ${i}` },
      },
    }));
};

const generatePagesPermissions = (opts, length: number) => {
  return Array(length)
    .fill(0)
    .map((_, i) => ({
      isDefaultPage: opts.isDefaultPage ? opts.isDefaultPage[i] : undefined,
    }));
};

describe('<PageList />', () => {
  it('renders title', () => {
    const title = 'Test title';
    const pages: any = generatePagesData(3);
    const pagesPermissions = generatePagesPermissions({}, 3);

    render(
      <PageList
        title={title}
        pages={pages}
        pagesPermissions={pagesPermissions}
      />
    );

    expect(screen.getByText('Test title')).toBeInTheDocument();
  });
});
