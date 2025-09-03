import { capitalize, withoutSpacing } from './textUtils';

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

describe('capitalize', () => {
  it('capitalizes strings correctly', () => {
    expect(capitalize(`hello world`)).toEqual('Hello world');
    expect(capitalize(`hello World`)).toEqual('Hello World');
    expect(capitalize(`HELLO WORLD`)).toEqual('HELLO WORLD');
    expect(capitalize('123')).toEqual('123');
    expect(capitalize('!@#')).toEqual('!@#');
    expect(capitalize('')).toEqual('');
    expect(capitalize('a')).toEqual('A');
  });
});
