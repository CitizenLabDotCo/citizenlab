import { anyThumbOf, thumbFile, thumbOf, thumbViewport, ThumbManifest } from './thumbs';

const manifest: ThumbManifest = {
  globals: { city: 'linz', lang: 'en' },
  thumbs: {
    'components-button--default': {
      file: 'components-button--default.png',
      width: 320,
      height: 200,
    },
  },
};

describe('thumbs', () => {
  it('sizes a picture as the card lays its story out', () => {
    expect(thumbViewport('components')).toEqual({ width: 320, height: 200 });
    expect(thumbViewport('pages')).toEqual({ width: 520, height: 325 });
    expect(thumbViewport(null)).toEqual({ width: 520, height: 325 });
  });

  it('names a picture after its story', () => {
    expect(thumbFile('a/b--c d')).toBe('a-b--c-d.png');
  });

  it('gives the picture only for the globals it was taken with', () => {
    const en = { city: 'linz', lang: 'en' };
    expect(thumbOf(manifest, 'components-button--default', en)?.file).toBe(
      'components-button--default.png'
    );
    expect(
      thumbOf(manifest, 'components-button--default', { ...en, lang: 'ar' })
    ).toBeUndefined();
    expect(thumbOf(manifest, 'nope', en)).toBeUndefined();
    expect(thumbOf(null, 'components-button--default', en)).toBeUndefined();
  });

  it('still has the picture in another city, for the card to mark', () => {
    expect(anyThumbOf(manifest, 'components-button--default')?.file).toBe(
      'components-button--default.png'
    );
    expect(anyThumbOf(null, 'components-button--default')).toBeUndefined();
  });
});
