import React from 'react';
import { render, screen } from 'utils/testUtils/rtl';
import PageList from './index';

jest.mock('services/locale');
jest.mock('services/appConfiguration');

const generateNavbarItems = (length: number) => {
  return Array(length)
    .fill(0)
    .map((_, i) => ({
      id: `_${i}`,
      attributes: {
        title_multiloc: { en: `English title ${i}` },
      },
    }));
};

describe('<PageList />', () => {
  it('renders title', () => {
    const title = 'Test title';
    const navbarItems: any = generateNavbarItems(3);

    render(
      <PageList
        title={title}
        navbarItems={navbarItems}
        getDisplaySettings={() => ({})}
      />
    );

    expect(screen.getByText('Test title')).toBeInTheDocument();
  });
});
