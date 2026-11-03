import React from 'react';

import { IMAGE_LOADED_EVENT } from 'components/admin/ContentBuilder/constants';

import eventEmitter from 'utils/eventEmitter';
import { fireEvent, render, screen } from 'utils/testUtils/rtl';

import Image from '.';

jest.mock('utils/eventEmitter');
jest.mock('components/admin/ContentBuilder/useCraftComponentDefaultPadding');
jest.mock('@craftjs/core', () => ({
  ...jest.requireActual('@craftjs/core'),
  useEditor: () => ({ enabled: false }),
}));

const imageUrl = 'https://example.org/one.png';

describe('ImageMultiloc', () => {
  it('announces the image once it has loaded', () => {
    render(<Image image={{ imageUrl }} alt={{ en: 'A photo' }} />);

    fireEvent.load(screen.getByRole('img'));

    expect(eventEmitter.emit).toHaveBeenCalledWith(
      IMAGE_LOADED_EVENT,
      imageUrl
    );
  });

  it('announces the image when it fails to load, so the page-level wait can finish', () => {
    render(<Image image={{ imageUrl }} alt={{ en: 'A photo' }} />);

    fireEvent.error(screen.getByRole('img'));

    expect(eventEmitter.emit).toHaveBeenCalledWith(
      IMAGE_LOADED_EVENT,
      imageUrl
    );
  });
});
