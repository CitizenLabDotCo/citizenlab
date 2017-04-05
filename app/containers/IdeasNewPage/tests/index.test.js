import canPublish from '../canPublish';

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
});
