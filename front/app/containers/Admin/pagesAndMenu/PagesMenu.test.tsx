import React from 'react';
import { render, waitFor } from 'utils/testUtils/rtl';
import PagesMenu from '.';

const metaTitle = 'Pages & Menu';

jest.mock('utils/cl-intl');
jest.mock('./messages', () => ({
  pagesMenuMetaTitle: { id: 'id', defaultMessage: metaTitle },
}));

describe('<PagesMenu />', () => {
  it('renders header', async () => {
    render(<PagesMenu />);

    await waitFor(() => expect(document.title).toContain(metaTitle));
  });
});
