import { isPicked, pickedOptions, togglePicked } from './selection';

const open = { label: 'Open', values: ['collecting_data', 'informing'] };
const ended = { label: 'Ended', values: ['past'] };

describe('isPicked', () => {
  it('takes any value the option stands for', () => {
    expect(isPicked(open, ['collecting_data', 'informing'])).toBe(true);
    expect(isPicked(open, ['informing'])).toBe(true);
    expect(isPicked(open, ['past'])).toBe(false);
  });
});

describe('togglePicked', () => {
  it('adds all the values of an option that is not picked', () => {
    expect(togglePicked(open, ['past'])).toEqual([
      'past',
      'collecting_data',
      'informing',
    ]);
  });

  it('removes the rest of an option that is partly in', () => {
    expect(togglePicked(open, ['informing', 'past'])).toEqual(['past']);
  });

  it('removes all the values of a picked option', () => {
    expect(
      togglePicked(open, ['collecting_data', 'past', 'informing'])
    ).toEqual(['past']);
  });
});

describe('pickedOptions', () => {
  it('keeps the options with a value in', () => {
    expect(pickedOptions([open, ended], ['past'])).toEqual([ended]);
    expect(pickedOptions([open, ended], ['informing', 'past'])).toEqual([
      open,
      ended,
    ]);
  });
});
