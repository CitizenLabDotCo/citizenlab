import changedFields from './changedFields';

describe('changedFields', () => {
  const title = { en: 'Current phase' };
  const previous = {
    title_multiloc: title,
    start_at: '2018-03-28',
    end_at: null,
    submission_enabled: true,
  };

  it('returns only the fields whose value changed', () => {
    const next = { ...previous, submission_enabled: false };

    expect(changedFields(next, previous)).toEqual({
      submission_enabled: false,
    });
  });

  it('leaves out fields the edit did not touch', () => {
    const next = { ...previous, submission_enabled: false };

    expect(changedFields(next, previous)).not.toHaveProperty('title_multiloc');
    expect(changedFields(next, previous)).not.toHaveProperty('start_at');
  });

  it('returns nothing when the phase came back unchanged', () => {
    expect(changedFields({ ...previous }, previous)).toEqual({});
  });

  it('reports a multiloc that was replaced', () => {
    const next = { ...previous, title_multiloc: { en: 'Renamed' } };

    expect(changedFields(next, previous)).toEqual({
      title_multiloc: { en: 'Renamed' },
    });
  });

  it('collects several changes from one edit', () => {
    const next = { ...previous, start_at: '2019-01-01', end_at: '2019-02-01' };

    expect(changedFields(next, previous)).toEqual({
      start_at: '2019-01-01',
      end_at: '2019-02-01',
    });
  });
});
