import React from 'react';
import { render, screen, waitFor } from 'utils/testUtils/rtl';
import QuillEditedContent from '.';
import 'jest-styled-components';

describe('QuillEditedContent component', () => {
  it('Should change tabIndex on children properly', async () => {
    // multiple rerenders to simulate a user showing/hiding the contentnt multiple times

    const { rerender } = render(
      <QuillEditedContent>
        <a href="www.google.com" data-testid="link">
          link
        </a>
        <button data-testid="button">button</button>
        <iframe data-testid="iframe">
          <div>iframe content</div>
        </iframe>
      </QuillEditedContent>
    );

    rerender(
      <QuillEditedContent disableTabbing={false}>
        <a href="www.google.com" data-testid="link">
          link
        </a>
        <button data-testid="button">button</button>
        <iframe data-testid="iframe">
          <div>iframe content</div>
        </iframe>
      </QuillEditedContent>
    );

    await waitFor(() => {
      expect(screen.getByTestId('link')).toHaveAttribute('tabindex', '0');
      expect(screen.getByTestId('button')).toHaveAttribute('tabindex', '0');
      expect(screen.getByTestId('iframe')).toHaveAttribute('tabindex', '0');
    });

    rerender(
      <QuillEditedContent disableTabbing={true}>
        <a href="www.google.com" data-testid="link">
          link
        </a>
        <button data-testid="button">button</button>
        <iframe data-testid="iframe">
          <div>iframe content</div>
        </iframe>
      </QuillEditedContent>
    );

    await waitFor(() => {
      expect(screen.getByTestId('link')).toHaveAttribute('tabindex', '-1');
      expect(screen.getByTestId('button')).toHaveAttribute('tabindex', '-1');
      expect(screen.getByTestId('iframe')).toHaveAttribute('tabindex', '-1');
    });

    rerender(
      <QuillEditedContent disableTabbing={false}>
        <a href="www.google.com" data-testid="link">
          link
        </a>
        <button data-testid="button">button</button>
        <iframe data-testid="iframe">
          <div>iframe content</div>
        </iframe>
      </QuillEditedContent>
    );

    await waitFor(() => {
      expect(screen.getByTestId('link')).toHaveAttribute('tabindex', '0');
      expect(screen.getByTestId('button')).toHaveAttribute('tabindex', '0');
      expect(screen.getByTestId('iframe')).toHaveAttribute('tabindex', '0');
    });
  });
});
