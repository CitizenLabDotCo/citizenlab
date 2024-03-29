import { setPathnameLocale } from './setPathnameLocale';

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
