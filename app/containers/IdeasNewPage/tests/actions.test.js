import {
  attachmentsLoaded, attachmentStored, draftLoaded, imagesLoaded, imageStored, loadAttachmentsError, loadDraftError,
  loadImagesError,
  storeAttachmentError,
  storeImageError,
} from '../actions';
describe('actions', () => {
  it('draftLoaded should return loadDraftError().type if content is undefined', () => {
    expect(draftLoaded(undefined)).toEqual(loadDraftError());
  });

  it('attachmentsLoaded should return loadAttachmentsError().type if sources is undefined', () => {
    expect(attachmentsLoaded(undefined)).toEqual(loadAttachmentsError());
  });

  it('attachmentStored should return storeAttachmentError().type if file is undefined', () => {
    expect(attachmentStored(undefined)).toEqual(storeAttachmentError());
  });

  it('imagesLoaded should return loadImagesError().type if sources is undefined', () => {
    expect(imagesLoaded(undefined)).toEqual(loadImagesError());
  });

  it('imageStored should return storeImageError().type if file is undefined', () => {
    expect(imageStored(undefined)).toEqual(storeImageError());
  });
});

