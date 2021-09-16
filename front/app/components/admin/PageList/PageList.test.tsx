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
    const pagesData: any = generatePagesData(3);
    const pagesPermissions = generatePagesPermissions({}, 3);

    render(
      <PageList
        title={title}
        pagesData={pagesData}
        pagesPermissions={pagesPermissions}
      />
    );

    expect(screen.getByText('Test title')).toBeInTheDocument();
  });

  describe('<UnsortablePageList />', () => {
    it('shows default tag when needed', () => {
      const title = 'Test title';
      const pagesData: any = generatePagesData(4);
      const pagesPermissions = generatePagesPermissions(
        { isDefaultPage: [true, true] },
        4
      );

      render(
        <PageList
          title={title}
          pagesData={pagesData}
          pagesPermissions={pagesPermissions}
        />
      );

      expect(screen.getAllByTestId('default-tag')).toHaveLength(2);
    });
  });

  describe('<SortablePageList />', () => {
    it('shows default tag when needed', () => {
      const title = 'Test title';
      const pagesData: any = generatePagesData(4);
      const pagesPermissions = generatePagesPermissions(
        { isDefaultPage: [true, true] },
        4
      );

      render(
        <PageList
          title={title}
          pagesData={pagesData}
          pagesPermissions={pagesPermissions}
          sortable={true}
        />
      );

      expect(screen.getAllByTestId('default-tag')).toHaveLength(2);
    });
  });
});
