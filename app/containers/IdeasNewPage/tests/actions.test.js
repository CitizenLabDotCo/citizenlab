import {
  draftLoaded, loadDraftError, storeAttachment, storeAttachmentError, storeImage, storeImageError,
} from '../actions';

describe('actions', () => {
  it('draftLoaded should return loadDraftError().type if content is undefined', () => {
    expect(draftLoaded(undefined)).toEqual(loadDraftError());
  });

  it('storeAttachment should return storeAttachmentError().type if file is undefined', () => {
    expect(storeAttachment(undefined)).toEqual(storeAttachmentError());
  });

  it('storeImage should return storeImageError().type if file is undefined', () => {
    expect(storeImage(undefined)).toEqual(storeImageError());
  });
});

