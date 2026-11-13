import React from 'react';

import { fireEvent, render, screen } from 'utils/testUtils/rtl';

import OnlineLink from './OnlineLink';

describe('OnlineLink', () => {
  it('opens the link in a new tab without giving it access to our window', () => {
    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);
    const link = 'https://us02web.zoom.us/j/123';

    render(<OnlineLink link={link} />);
    fireEvent.click(screen.getByRole('button'));

    expect(openSpy).toHaveBeenCalledWith(link, '_blank', 'noopener,noreferrer');
    openSpy.mockRestore();
  });
});
