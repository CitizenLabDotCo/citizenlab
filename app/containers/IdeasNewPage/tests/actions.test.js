import {
  draftLoaded, loadDraftError,
} from '../actions';

describe('actions', () => {
  it('draftLoaded should return loadDraftError().type if content is undefined', () => {
    expect(draftLoaded(undefined)).toEqual(loadDraftError());
  });
});

