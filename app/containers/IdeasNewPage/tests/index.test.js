import { stringMock } from 'utils/testing/constants';

import canPublish from '../editor/canPublish';
import { mapDispatchToProps } from '../index';
import { storeAttachmentError, storeImageError, storeSelectedAreas, storeSelectedTopics } from '../actions';

describe('index', () => {
  describe('canPublish', () => {
    it('should not allow publishing an idea if title is invalid', () => {
      // we assume content is valid
      const content = '<p>some content</p>';
      const titleError = true;
      const topics = [stringMock];
      const areas = [stringMock];

      expect(canPublish(content, titleError, topics, areas)).toEqual(false);
    });

    it('should not allow publishing an idea if content is invalid', () => {
      // empty content
      const content = '<p></p>';
      // we assume title is valid
      const titleError = false;
      const topics = [stringMock];
      const areas = [stringMock];

      expect(canPublish(content, titleError, topics, areas)).toEqual(false);
    });

    it('should not allow publishing an idea if no topic specified', () => {
      // empty content
      const content = `<p>${stringMock}</p>`;
      // we assume title is valid
      const titleError = false;
      const topics = [];
      const areas = [stringMock];

      expect(canPublish(content, titleError, topics, areas)).toEqual(false);
    });

    it('should not allow publishing an idea if content is invalid', () => {
      // empty content
      const content = '<p></p>';
      // we assume title is valid
      const titleError = false;
      const topics = [stringMock];
      const areas = [];

      expect(canPublish(content, titleError, topics, areas)).toEqual(false);
    });
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
    describe('store topics and areas', () => {
      const selectedItems = [];
      for (let i = 0; i < 3; i += 1) {
        selectedItems.push({
          label: {
            en: stringMock,
            nl: stringMock,
          },
          value: stringMock,
        });
      }
      const parsedItems = selectedItems.map((item) => item.value);

      describe('handleTopicsSelect', () => {
        it('should dispatch storeSelectedTopics with provided ids', () => {
          result.handleTopicsSelect(selectedItems);
          expect(dispatch).toHaveBeenCalledWith(storeSelectedTopics(parsedItems));
        });
      });

      describe('handleAreasSelect', () => {
        it('should dispatch storeSelectedAreas with provided ids', () => {
          result.handleAreasSelect(selectedItems);
          expect(dispatch).toHaveBeenCalledWith(storeSelectedAreas(parsedItems));
        });
      });
    });
  });
});
