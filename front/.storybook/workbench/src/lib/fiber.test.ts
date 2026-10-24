import {
  componentSite,
  isLibrary,
  nameOf,
  platformFile,
  propsOf,
  sourceOf,
} from './fiber';

const BUTTON =
  '/home/tali/citizenlab/front/app/component-library/components/Button/index.tsx';
const PAGE = '/home/tali/citizenlab/front/app/containers/Admin/Page/index.tsx';

const Button = () => null;
const Page = () => null;
const StyledButton = { displayName: 'StyledButton', render: () => null };

const tree = () => {
  const page = { type: Page, return: null };
  const button = {
    type: Button,
    return: page,
    memoizedProps: { buttonStyle: 'primary', onClick: () => 0, children: 'x' },
    _debugSource: { fileName: PAGE, lineNumber: 40, columnNumber: 7 },
    _debugOwner: page,
  };
  const styled = {
    type: StyledButton,
    return: button,
    memoizedProps: { disabled: false },
    _debugSource: { fileName: BUTTON, lineNumber: 825, columnNumber: 5 },
    _debugOwner: button,
  };
  const host = {
    type: 'button',
    return: styled,
    _debugSource: {
      fileName: '/x/node_modules/styled-components/index.js',
      lineNumber: 1,
    },
  };
  return host;
};

describe('sourceOf', () => {
  it('lists the platform JSX sites above an element, nearest first', () => {
    const el = document.createElement('button');
    (el as any).__reactFiber$abc = tree();
    const src = sourceOf(el)!;
    expect(src.sites).toEqual([
      {
        file: 'app/component-library/components/Button/index.tsx',
        line: 825,
        col: 5,
        element: 'StyledButton',
        owner: 'Button',
      },
      {
        file: 'app/containers/Admin/Page/index.tsx',
        line: 40,
        col: 7,
        element: 'Button',
        owner: 'Page',
      },
    ]);
    expect(src.props).toEqual([['disabled', 'false']]);
    expect(isLibrary(src.sites[0])).toBe(true);
  });

  it('has nothing for an element React did not render', () => {
    expect(sourceOf(document.createElement('div'))).toBeNull();
  });
});

describe('names', () => {
  it('skips plumbing and names a generated owner after its file', () => {
    const anon = { type: { render: () => null }, return: null };
    const msg = {
      type: 'span',
      return: anon,
      _debugSource: {
        fileName: '/x/app/utils/cl-intl/FormattedMessage/index.tsx',
        lineNumber: 32,
      },
    };
    const btn = {
      type: 'button',
      return: msg,
      _debugSource: { fileName: BUTTON, lineNumber: 825 },
      _debugOwner: { type: function _c7() {} },
    };
    const el = document.createElement('span');
    (el as any).__reactFiber$x = { type: 'span', return: btn };
    // The span's own site is plumbing; the button's owner is unnamed.
    const src = sourceOf(el)!;
    expect(src.sites.map((s) => [s.file.split('/').pop(), s.owner])).toEqual([
      ['index.tsx', 'Button'],
    ]);
    expect(componentSite(src)?.line).toBe(825);
  });
});

describe('helpers', () => {
  it('names through forwardRef and memo', () => {
    expect(nameOf({ type: { render: function Card() {} } })).toBe('Card');
    expect(nameOf('div')).toBe('div');
  });

  it('keeps platform files only', () => {
    expect(platformFile(PAGE)).toBe('app/containers/Admin/Page/index.tsx');
    expect(platformFile('/x/node_modules/app/y.js')).toBeUndefined();
    expect(platformFile('/x/.storybook/preview.tsx')).toBeUndefined();
  });

  it('writes props short', () => {
    expect(
      propsOf({ a: 'hi', b: 2, c: () => 0, d: [1, 2], e: null, children: 'x' })
    ).toEqual([
      ['a', '"hi"'],
      ['b', '2'],
      ['c', 'function'],
      ['d', '[2]'],
    ]);
  });
});
