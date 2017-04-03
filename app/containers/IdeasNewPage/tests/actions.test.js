import {
  attachmentsLoaded, attachmentStored, draftLoaded, storeImage, loadAttachmentsError, loadDraftError,
} from '../actions';

describe('actions', () => {
  it('draftLoaded should return loadDraftError().type if content is undefined', () => {
    expect(draftLoaded(undefined)).toEqual(loadDraftError());
  });

  it('storeAttachment should return storeAttachmentError().type if file is undefined', () => {
    expect(attachmentStored(undefined)).toEqual(storeAttachmentError());
  });

  it('storeImage should return storeImageError().type if file is undefined', () => {
    expect(imageStored(undefined)).toEqual(storeImageError());
  });
});

