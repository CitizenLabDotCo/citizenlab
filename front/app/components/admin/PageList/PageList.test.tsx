import React from 'react';
import { render, screen } from 'utils/testUtils/rtl';
import PageList from '.';

jest.mock('hooks/useLocale');

const generatePagesData = () => [
  {
    id: '_1',
    attributes: {
      title_multiloc: { en: 'English title 1' },
    },
  },
  {
    id: '_2',
    attributes: {
      title_multiloc: { en: 'English title 2' },
    },
  },
  {
    id: '_3',
    attributes: {
      title_multiloc: { en: 'English title 3' },
    },
  },
];

const generatePagesPermissions = () => [{}, {}, {}];

describe('<PageList />', () => {
  it('renders title', () => {
    const title = 'Test title';
    const pagesData: any = generatePagesData();
    const pagesPermissions = generatePagesPermissions();

    render(
      <PageList
        title={title}
        pagesData={pagesData}
        pagesPermissions={pagesPermissions}
      />
    );

    expect(screen.getByText('Test title')).toBeInTheDocument();
  });
});
