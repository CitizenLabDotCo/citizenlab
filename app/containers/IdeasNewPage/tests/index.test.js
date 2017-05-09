import canPublish from '../editor/canPublish';
import { mapDispatchToProps } from '../index';
import { storeAttachmentError, storeImageError } from '../actions';

describe('index', () => {
  it('should not allow publishing an idea if title is invalid', () => {
    // we assume content is valid
    const content = '<p>some content</p>';
    const titleError = true;

    expect(canPublish(content, titleError)).toEqual(false);
  });

  it('should not allow publishing an idea if content is invalid', () => {
    // empty content
    const content = '<p></p>';
    // we assume title is valid
    const titleError = false;

    expect(canPublish(content, titleError)).toEqual(false);
  });

  describe('mapDispatchToProps', () => {
    const dispatch = jest.fn();
    const result = mapDispatchToProps(dispatch);

    describe('storeAttachment', () => {
      it('should dispatch storeAttachmentError if no attachment is provided', () => {
        result.storeAttachment(null);
        expect(dispatch).toHaveBeenCalledWith(storeAttachmentError());
      });
    });
    describe('storeImage', () => {
      it('should dispatch storeImageError if no image is provided', () => {
        result.storeImage(null);
        expect(dispatch).toHaveBeenCalledWith(storeImageError());
      });
    });
  });
});
