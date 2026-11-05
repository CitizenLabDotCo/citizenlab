import messages from '../../messages';

import { getTextResponseTitle } from './utils';

describe('getTextResponseTitle', () => {
  it('returns the "other" title for other_option', () => {
    expect(getTextResponseTitle({ textResponseSource: 'other_option' })).toBe(
      messages.otherResponses
    );
  });

  it('returns the follow-up title for follow_up', () => {
    expect(getTextResponseTitle({ textResponseSource: 'follow_up' })).toBe(
      messages.followUpResponses
    );
  });

  it('returns the all-responses title for free_text', () => {
    expect(getTextResponseTitle({ textResponseSource: 'free_text' })).toBe(
      messages.allResponses
    );
  });

  it('defaults to the all-responses title when source is undefined', () => {
    expect(getTextResponseTitle({})).toBe(messages.allResponses);
  });
});
