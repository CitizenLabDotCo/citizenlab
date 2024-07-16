import { replacePathnameLocale } from './replacePathnameLocale';

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
