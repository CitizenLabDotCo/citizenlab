import { Color, colors } from '../../utils/styleUtils';

import { getColor } from './utils';

jest.mock('polished', () => ({
  // Mock the 'darken' function
  darken: (color: Color, amount: number) => `darkened_${color}_${amount}`,
  // Mock the 'lighten' function
  lighten: (color: Color, amount: number) => `lightened_${color}_${amount}`,
  // Mock the 'transparentize' function
  transparentize: (color: Color, amount: number) =>
    `transparent_${color}_${amount}`,
}));

describe('getColor', () => {
  it('returns correct colors when checkbox is not checked or indeterminate', () => {
    const borderColor = getColor({
      checkedOrIndeterminate: false,
      element: 'border',
    });
    const hoverBorderColor = getColor({
      checkedOrIndeterminate: false,
      element: 'hoverBorder',
    });
    const backgroundColor = getColor({
      checkedOrIndeterminate: false,
      element: 'background',
    });
    const hoverBackgroundColor = getColor({
      checkedOrIndeterminate: false,
      element: 'hoverBackground',
    });
    expect(borderColor).toEqual('#767676');
    expect(hoverBorderColor).toEqual('#000000');
    expect(backgroundColor).toEqual('#ffffff');
    expect(hoverBackgroundColor).toEqual('#ffffff');
  });
  it('returns correct colors when checkbox is checked, and no custom color provided', () => {
    const borderColor = getColor({
      checkedOrIndeterminate: true,
      element: 'border',
    });
    const hoverBorderColor = getColor({
      checkedOrIndeterminate: true,
      element: 'hoverBorder',
    });
    const backgroundColor = getColor({
      checkedOrIndeterminate: true,
      element: 'background',
    });
    const hoverBackgroundColor = getColor({
      checkedOrIndeterminate: true,
      element: 'hoverBackground',
    });
    expect(borderColor).toEqual('#04884C');
    expect(hoverBorderColor).toEqual('darkened_0.05_#04884C');
    expect(backgroundColor).toEqual('#04884C');
    expect(hoverBackgroundColor).toEqual('darkened_0.05_#04884C');
  });
  it('returns correct colors when checkbox is checked, and a custom color provided', () => {
    const borderColor = getColor({
      checkedColor: colors.teal500,
      checkedOrIndeterminate: true,
      element: 'border',
    });
    const hoverBorderColor = getColor({
      checkedColor: colors.teal500,
      checkedOrIndeterminate: true,
      element: 'hoverBorder',
    });
    const backgroundColor = getColor({
      checkedColor: colors.teal500,
      checkedOrIndeterminate: true,
      element: 'background',
    });
    const hoverBackgroundColor = getColor({
      checkedColor: colors.teal500,
      checkedOrIndeterminate: true,
      element: 'hoverBackground',
    });
    expect(borderColor).toEqual('#147985');
    expect(hoverBorderColor).toEqual('darkened_0.05_#147985');
    expect(backgroundColor).toEqual('#147985');
    expect(hoverBackgroundColor).toEqual('darkened_0.05_#147985');
  });
});
