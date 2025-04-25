import getOtherControlKey from './getOtherControlKey';

describe('getOtherControlKey', () => {
  it('works', () => {
    expect(getOtherControlKey('#/properties/single_choice_o0b_other')).toBe(
      'single_choice_o0b'
    );
  });
});
