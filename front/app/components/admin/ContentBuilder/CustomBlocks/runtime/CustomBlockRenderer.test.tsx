import React from 'react';

import { render, screen } from 'utils/testUtils/rtl';

import CustomBlockRenderer from './CustomBlockRenderer';

const Bomb = () => {
  throw new Error('boom');
};
const Fine = () => <div>fine-content</div>;
const msg = (id: string) => id;

describe('CustomBlockRenderer error boundary', () => {
  // React logs caught render errors; keep the test output clean.
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  it('latches on a throwing block and stays latched across re-renders with the same resetKey', () => {
    const onError = jest.fn();
    const resetKey = {};

    const { rerender } = render(
      <CustomBlockRenderer
        component={Bomb}
        config={{}}
        msg={msg}
        onError={onError}
        fallback={<div>fallback-ui</div>}
        resetKey={resetKey}
      />
    );

    expect(screen.getByText('fallback-ui')).toBeInTheDocument();
    expect(onError).toHaveBeenCalledTimes(1);

    // The regression this guards: parent re-renders (children get a new
    // element identity) must NOT re-arm the boundary, or a block that throws
    // on every render locks the page in a throw/catch/reset loop.
    rerender(
      <CustomBlockRenderer
        component={Bomb}
        config={{}}
        msg={msg}
        onError={onError}
        fallback={<div>fallback-ui</div>}
        resetKey={resetKey}
      />
    );

    expect(screen.getByText('fallback-ui')).toBeInTheDocument();
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('retries the children when the resetKey changes', () => {
    const { rerender } = render(
      <CustomBlockRenderer
        component={Bomb}
        config={{}}
        msg={msg}
        fallback={<div>fallback-ui</div>}
        resetKey={{}}
      />
    );

    expect(screen.getByText('fallback-ui')).toBeInTheDocument();

    rerender(
      <CustomBlockRenderer
        component={Fine}
        config={{}}
        msg={msg}
        fallback={<div>fallback-ui</div>}
        resetKey={{}}
      />
    );

    expect(screen.getByText('fine-content')).toBeInTheDocument();
  });
});
