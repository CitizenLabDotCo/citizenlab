import getFollowUpControlKey from './getFollowUpControlKey';

describe('getFollowUpControlKey', () => {
  it('works', () => {
    expect(
      getFollowUpControlKey('#/properties/sentiment_linear_scale_o0b_follow_up')
    ).toBe('sentiment_linear_scale_o0b');
  });
});
