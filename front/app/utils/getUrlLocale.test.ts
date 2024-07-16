import { getUrlLocale } from './getUrlLocale';

describe('getUrlLocale', () => {
  it('gets /fr/', () => {
    expect(getUrlLocale('/fr/')).toEqual('fr');
  });
  it('gets /en/projects/projects-slug/lalalal', () => {
    expect(getUrlLocale('/en/projects/projects-slug/lalalal')).toEqual('en');
  });
  it('gets /nl-BE/projects/projects-slug/lalalal/', () => {
    expect(getUrlLocale('/nl-BE/projects/projects-slug/lalalal/')).toEqual(
      'nl-BE'
    );
  });
  it('gets fr/projects/projects-slug/lalalal/', () => {
    expect(getUrlLocale('fr/projects/projects-slug/lalalal/')).toEqual('fr');
  });
  it('gets fr/projects/projects-slug/lalalal', () => {
    expect(getUrlLocale('fr/projects/projects-slug/lalalal')).toEqual('fr');
  });
  it('gets fr/projects/projects-slug/lalalal', () => {
    expect(getUrlLocale('fr/projects/projects-slug/lalalal')).toEqual('fr');
  });
});
