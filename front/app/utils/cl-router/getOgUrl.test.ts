import getOgUrl from './getOgUrl';

const setUrl = (url: string) => {
  window.history.pushState({}, '', url);
};

describe('getOgUrl', () => {
  afterEach(() => {
    setUrl('/');
  });

  it('removes the prerender cookie param', () => {
    setUrl('/en/folders/buses?yes-I-accept-cookies=%22true%22');
    expect(getOgUrl()).toBe(`${window.location.origin}/en/folders/buses`);
  });

  it('keeps other search params', () => {
    setUrl('/en/projects/x/ideas/new?phase_id=1&yes-I-accept-cookies=true');
    expect(getOgUrl()).toBe(
      `${window.location.origin}/en/projects/x/ideas/new?phase_id=1`
    );
  });

  it('leaves the query untouched when the param is absent', () => {
    setUrl('/en/projects/x?search=a%20b&focusSearch');
    expect(getOgUrl()).toBe(
      `${window.location.origin}/en/projects/x?search=a%20b&focusSearch`
    );
  });

  it('removes the hash', () => {
    setUrl('/en/ideas/foo?phase_id=1#comments');
    expect(getOgUrl()).toBe(
      `${window.location.origin}/en/ideas/foo?phase_id=1`
    );
  });
});
