import { removeUrlLocale } from './removeUrlLocale';

describe('removeUrlLocale', () => {
  it('removes url from /fr/', () => {
    expect(removeUrlLocale('/fr/')).toEqual('/');
  });
  it('removes url from /en/projects/projects-slug/lalalal', () => {
    expect(removeUrlLocale('/en/projects/projects-slug/lalalal')).toEqual(
      '/projects/projects-slug/lalalal'
    );
  });
  it('removes url from /nl-BE/projects/projects-slug/lalalal/', () => {
    expect(removeUrlLocale('/nl-BE/projects/projects-slug/lalalal/')).toEqual(
      '/projects/projects-slug/lalalal'
    );
  });
  it('removes url from fr/projects/projects-slug/lalalal/', () => {
    expect(removeUrlLocale('fr/projects/projects-slug/lalalal/')).toEqual(
      '/projects/projects-slug/lalalal'
    );
  });
});
