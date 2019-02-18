import { setPathnameLocale, replacePathnameLocale } from './locale';

describe('setPathnameLocale', () => {
  it('sets /', () => {
    expect(setPathnameLocale('/', 'nl-BE')).toEqual('/nl-BE/');
  });
  it('sets /projects/projects-slug/lalalal', () => {
    expect(setPathnameLocale('/projects/projects-slug/lalalal', 'nl-BE')).toEqual('/nl-BE/projects/projects-slug/lalalal');
  });
  it('sets /projects/projects-slug/lalalal/', () => {
    expect(setPathnameLocale('/projects/projects-slug/lalalal/', 'nl-BE')).toEqual('/nl-BE/projects/projects-slug/lalalal/');
  });
});
describe('replacePathnameLocale', () => {
  it('sets /', () => {
    expect(replacePathnameLocale('/fr/', 'nl-BE')).toEqual('/nl-BE/');
  });
  it('sets /fr/projects/projects-slug/lalalal', () => {
    expect(replacePathnameLocale('/fr/projects/projects-slug/lalalal', 'nl-BE')).toEqual('/nl-BE/projects/projects-slug/lalalal');
  });
  it('sets /fr/projects/projects-slug/lalalal/', () => {
    expect(replacePathnameLocale('/fr/projects/projects-slug/lalalal/', 'nl-BE')).toEqual('/nl-BE/projects/projects-slug/lalalal');
  });
  it('sets fr/projects/projects-slug/lalalal/', () => {
    expect(replacePathnameLocale('fr/projects/projects-slug/lalalal/', 'nl-BE')).toEqual('/nl-BE/projects/projects-slug/lalalal');
  });
});
