import React from 'react';

import ReactSelect from 'react-select';

import { render, screen, userEvent, waitFor } from 'utils/testUtils/rtl';

import { VirtualizedMenuList, VirtualizedOption } from '.';

const OPTION_COUNT = 150;
// A label long enough to wrap onto two lines, so the estimated row height is
// wrong and only measuring gives the right offsets.
const MEASURED_OPTION_HEIGHT = 72;

const options = Array.from({ length: OPTION_COUNT }, (_, index) => ({
  value: `option-${index + 1}`,
  label: `Option ${index + 1}`,
}));

const renderSelect = () =>
  render(
    <ReactSelect
      inputId="select"
      options={options}
      menuIsOpen
      components={{
        MenuList: VirtualizedMenuList,
        Option: VirtualizedOption,
      }}
    />
  );

const stubRect = (height: number): DOMRect => ({
  height,
  bottom: height,
  width: 0,
  top: 0,
  left: 0,
  right: 0,
  x: 0,
  y: 0,
  toJSON: () => ({}),
});

// jsdom lays nothing out and never scrolls, so both have to be stubbed to see
// what the virtualizer does with them.
const scrollTo = jest.fn();

beforeAll(() => {
  jest
    .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
    .mockImplementation(function (this: HTMLElement) {
      return stubRect(
        this.getAttribute('role') === 'option' ? MEASURED_OPTION_HEIGHT : 0
      );
    });
  HTMLElement.prototype.scrollTo = scrollTo;
});

beforeEach(() => {
  scrollTo.mockClear();
});

describe('VirtualizedMenu', () => {
  it('renders a window of the options and gives each its place in the full list', async () => {
    renderSelect();

    const rendered = await screen.findAllByRole('option');

    expect(rendered.length).toBeLessThan(OPTION_COUNT);
    expect(rendered[0]).toHaveAttribute('aria-setsize', String(OPTION_COUNT));
    expect(rendered[0]).toHaveAttribute('aria-posinset', '1');
    expect(rendered[1]).toHaveAttribute('aria-posinset', '2');
  });

  it('offsets the options by their measured height, not by the estimate', async () => {
    renderSelect();

    const rendered = await screen.findAllByRole('option');

    expect(rendered[0]).toHaveStyle({ top: '0px' });
    await waitFor(() =>
      expect(rendered[1]).toHaveStyle({ top: `${MEASURED_OPTION_HEIGHT}px` })
    );
    expect(rendered[2]).toHaveStyle({
      top: `${MEASURED_OPTION_HEIGHT * 2}px`,
    });
  });

  // Hovering focuses an option, and the menu used to scroll to whatever was
  // focused: the row under the pointer slid away as soon as it was touched.
  it('does not scroll when an option is hovered', async () => {
    const user = userEvent.setup();
    renderSelect();

    const rendered = await screen.findAllByRole('option');
    scrollTo.mockClear();

    await user.hover(rendered[1]);

    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('scrolls to an option focused outside the rendered window', async () => {
    const user = userEvent.setup();
    renderSelect();

    await screen.findAllByRole('option');
    await user.click(screen.getByRole('combobox'));
    scrollTo.mockClear();

    await user.keyboard('{End}');

    await waitFor(() => expect(scrollTo).toHaveBeenCalled());
  });
});
