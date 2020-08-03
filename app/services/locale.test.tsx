import {
  setPathnameLocale,
  replacePathnameLocale,
  getUrlLocale,
  removeUrlLocale,
} from './locale';

describe('setPathnameLocale', () => {
  it('sets /', () => {
    expect(setPathnameLocale('/', 'nl-BE')).toEqual('/nl-BE/');
  });
  it('sets /projects/projects-slug/lalalal', () => {
    expect(
      setPathnameLocale('/projects/projects-slug/lalalal', 'nl-BE')
    ).toEqual('/nl-BE/projects/projects-slug/lalalal');
  });
  it('sets /projects/projects-slug/lalalal/', () => {
    expect(
      setPathnameLocale('/projects/projects-slug/lalalal/', 'nl-BE')
    ).toEqual('/nl-BE/projects/projects-slug/lalalal/');
  });
});

describe('replacePathnameLocale', () => {
  it('sets /fr/', () => {
    expect(replacePathnameLocale('/fr/', 'nl-BE')).toEqual('/nl-BE/');
  });
  it('sets /fr/projects/projects-slug/lalalal', () => {
    expect(
      replacePathnameLocale('/fr/projects/projects-slug/lalalal', 'nl-BE')
    ).toEqual('/nl-BE/projects/projects-slug/lalalal');
  });
  it('sets /fr/projects/projects-slug/lalalal/', () => {
    expect(
      replacePathnameLocale('/fr/projects/projects-slug/lalalal/', 'nl-BE')
    ).toEqual('/nl-BE/projects/projects-slug/lalalal');
  });
  it('sets fr/projects/projects-slug/lalalal/', () => {
    expect(
      replacePathnameLocale('fr/projects/projects-slug/lalalal/', 'nl-BE')
    ).toEqual('/nl-BE/projects/projects-slug/lalalal');
  });
  it('sets fr/projects/projects-slug/lalalal', () => {
    expect(
      replacePathnameLocale('fr/projects/projects-slug/lalalal', 'nl-BE')
    ).toEqual('/nl-BE/projects/projects-slug/lalalal');
  });
});

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
