import React from 'react';

import { ICustomBlockVersion } from 'api/custom_blocks/types';

import { render, screen, waitFor } from 'utils/testUtils/rtl';

import CustomBlock from '.';

const BLOCK_ID = 'a1b2c3d4-0000-0000-0000-000000000001';

const mockUseCustomBlockVersion = jest.fn();
jest.mock('api/custom_blocks/useCustomBlockVersion', () => ({
  __esModule: true,
  default: (params: unknown) => mockUseCustomBlockVersion(params),
}));

const mockLoadBlockModule = jest.fn();
jest.mock('../runtime/loadBlockModule', () => ({
  loadBlockModule: (url: string) => mockLoadBlockModule(url),
}));

jest.mock('utils/router', () => ({
  useLocation: () => ({
    pathname: '/en/admin/reporting/report-builder/x/editor',
  }),
}));

const version = (
  overrides: Partial<ICustomBlockVersion['data']['attributes']> = {}
): ICustomBlockVersion => ({
  data: {
    id: 'version-1',
    type: 'custom_block_version',
    attributes: {
      number: 3,
      sdk_version: 'v1',
      manifest: {
        manifest_version: 1,
        sdk_version: 'v1',
        targets: ['report'],
        data_uses: [],
      },
      messages: { en: { heading: 'Contributions per month' } },
      created_at: '2026-09-01T00:00:00Z',
      block_title_multiloc: { en: 'Contributions chart' },
      block_status: 'published',
      ...overrides,
    },
  },
});

// The block the bundle would export: it reads whatever it was handed, so the
// assertions are about what the widget passes in.
const Block = ({
  msg,
  config,
}: {
  msg: (key: string) => string;
  config: Record<string, unknown>;
}) => (
  <div>
    <h2>{msg('heading')}</h2>
    <span data-testid="config">{JSON.stringify(config)}</span>
  </div>
);

describe('CustomBlock', () => {
  beforeEach(() => {
    mockUseCustomBlockVersion.mockReturnValue({ data: version() });
    mockLoadBlockModule.mockResolvedValue({ default: Block });
  });

  it('renders nothing until the node pins a block and a version', () => {
    render(<CustomBlock />);

    expect(screen.queryByTestId('custom-block-notice')).not.toBeInTheDocument();
    expect(mockLoadBlockModule).not.toHaveBeenCalled();
  });

  // The pin is the whole point: the bundle must be the version the layout names,
  // not whichever version the block happens to be on now.
  it('loads the bundle of the pinned version', async () => {
    render(<CustomBlock blockId={BLOCK_ID} version={3} />);

    await waitFor(() =>
      expect(mockLoadBlockModule).toHaveBeenCalledWith(
        `/web_api/v1/custom_blocks/${BLOCK_ID}/versions/3/bundle`
      )
    );
    expect(mockUseCustomBlockVersion).toHaveBeenCalledWith({
      blockId: BLOCK_ID,
      version: 3,
    });
  });

  it('gives the block its own catalogue and its config', async () => {
    render(<CustomBlock blockId={BLOCK_ID} version={3} config={{ topN: 5 }} />);

    expect(
      await screen.findByRole('heading', { name: 'Contributions per month' })
    ).toBeInTheDocument();
    expect(screen.getByTestId('config')).toHaveTextContent('{"topN":5}');
  });

  it('shows the builder why a block did not load', async () => {
    mockLoadBlockModule.mockRejectedValue(new Error('404'));

    render(<CustomBlock blockId={BLOCK_ID} version={3} />);

    expect(
      await screen.findByTestId('custom-block-notice')
    ).toBeInTheDocument();
  });

  it('does not run a disabled block', async () => {
    mockUseCustomBlockVersion.mockReturnValue({
      data: version({ block_status: 'disabled' }),
    });

    render(<CustomBlock blockId={BLOCK_ID} version={3} />);

    expect(
      await screen.findByTestId('custom-block-notice')
    ).toBeInTheDocument();
    expect(mockLoadBlockModule).not.toHaveBeenCalled();
  });

  it('contains a block that throws, instead of taking the report down with it', async () => {
    const Throwing = () => {
      throw new Error('the chart blew up');
    };
    mockLoadBlockModule.mockResolvedValue({ default: Throwing });
    // React logs the caught error; the boundary is what is under test.
    jest.spyOn(console, 'error').mockImplementation(() => undefined);

    render(<CustomBlock blockId={BLOCK_ID} version={3} />);

    expect(
      await screen.findByTestId('custom-block-notice')
    ).toBeInTheDocument();
  });
});
