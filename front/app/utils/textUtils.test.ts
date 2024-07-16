import { withoutSpacing } from './textUtils';

describe('withoutSpacing', () => {
  it('removes spaces from simple string', () => {
    expect(withoutSpacing`hello world`).toEqual('helloworld');
  });

  it('removes spaces from template string with expressions', () => {
    const expectedResult =
      '<ul><li>with spaces 1</li><li>with spaces 2</li></ul>';

    expect(withoutSpacing`
    <ul>
      <li>${'with spaces 1'}</li>
      <li>${'with spaces 2'}</li>
    </ul>
  `).toEqual(expectedResult);
  });
});
