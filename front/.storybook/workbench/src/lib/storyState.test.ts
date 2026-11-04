import { layerOf, stateKey } from './storyState';

const render = () => null;
const base = {
  initialArgs: { children: 'Save', size: 'm' },
  originalStoryFn: render,
};

describe('layerOf', () => {
  it('is the args a state changes from Default', () => {
    expect(
      layerOf(
        {
          initialArgs: { children: 'Save', size: 'm', disabled: true },
          originalStoryFn: render,
        },
        base
      )
    ).toEqual({ args: { disabled: true }, pseudo: [] });
  });

  it('turns pseudo parameters into the root classes', () => {
    expect(
      layerOf(
        {
          initialArgs: base.initialArgs,
          parameters: {
            pseudo: {
              hover: ['button'],
              focusVisible: true,
              rootSelector: 'x',
            },
          },
          originalStoryFn: render,
        },
        base
      )
    ).toEqual({
      args: {},
      pseudo: ['pseudo-hover-all', 'pseudo-focus-visible-all'],
    });
  });

  it('is null for a state with its own render', () => {
    expect(
      layerOf({ initialArgs: {}, originalStoryFn: () => null }, base)
    ).toBeNull();
  });
});

it('stateKey is the export part of the id', () => {
  expect(stateKey('components-actions-button--long-content')).toBe(
    'long-content'
  );
});
