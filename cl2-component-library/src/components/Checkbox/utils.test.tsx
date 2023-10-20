import { getColor } from './utils';
import { colors } from '../../utils/styleUtils';

describe('Checkbox getColor utility function', () => {
  it('returns correct colors when checkbox is not checked or indeterminate', () => {
    const borderColor = getColor({checkedOrIndeterminate: false, element: 'border'});
    const hoverBorderColor = getColor({checkedOrIndeterminate: false, element: 'hoverBorder'});
    const backgroundColor = getColor({checkedOrIndeterminate: false, element: 'background'});
    const hoverBackgroundColor = getColor({checkedOrIndeterminate: false, element: 'hoverBackground'});
    expect(borderColor).toEqual('#999999');
    expect(hoverBorderColor).toEqual('#000000');
    expect(backgroundColor).toEqual('#ffffff');
    expect(hoverBackgroundColor).toEqual('#ffffff');
  });
  it('returns correct colors when checkbox is checked, and no custom color provided', () => {
    const borderColor = getColor({checkedOrIndeterminate: true, element: 'border'});
    const hoverBorderColor = getColor({checkedOrIndeterminate: true, element: 'hoverBorder'});
    const backgroundColor = getColor({checkedOrIndeterminate: true, element: 'background'});
    const hoverBackgroundColor = getColor({checkedOrIndeterminate: true, element: 'hoverBackground'});
    expect(borderColor).toEqual('#04884C');
    expect(hoverBorderColor).toEqual('#036f3e');
    expect(backgroundColor).toEqual('#04884C');
    expect(hoverBackgroundColor).toEqual('#036f3e');
  });
  it('returns correct colors when checkbox is checked, and a custom color provided', () => {
    const borderColor = getColor({checkedColor: colors.teal500, checkedOrIndeterminate: true, element: 'border'});
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
    expect(hoverBorderColor).toEqual('#11656f');
    expect(backgroundColor).toEqual('#147985');
    expect(hoverBackgroundColor).toEqual('#11656f');
  });
});
