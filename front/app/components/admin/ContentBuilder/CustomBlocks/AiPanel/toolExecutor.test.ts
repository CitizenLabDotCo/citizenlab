import { executeToolCall, ToolExecutorContext } from './toolExecutor';

// The compile path needs the esbuild worker; these tests cover the pure
// tools only.
jest.mock('../compiler', () => ({
  compileAndCheckBlockSource: jest.fn(),
}));

describe('executeToolCall', () => {
  const buildContext = (): ToolExecutorContext & {
    setTitle: jest.Mock;
    setFiles: jest.Mock;
  } => ({
    setFiles: jest.fn(),
    setTitle: jest.fn(),
    setCompiled: jest.fn(),
    runtimeErrorsRef: { current: [] },
    tenantLocales: ['en', 'nl-BE'],
  });

  describe('set_title', () => {
    it('accepts a full multiloc title', async () => {
      const ctx = buildContext();
      const outcome = await executeToolCall(ctx, {
        id: 'tu_1',
        name: 'set_title',
        input: { title: { en: 'Before/after slider', 'nl-BE': 'Voor/na' } },
      });

      expect(outcome.isError).toBe(false);
      expect(ctx.setTitle).toHaveBeenCalledWith({
        en: 'Before/after slider',
        'nl-BE': 'Voor/na',
      });
      expect(outcome.content).not.toContain('Missing locales');
    });

    it('warns about missing locales but still applies', async () => {
      const ctx = buildContext();
      const outcome = await executeToolCall(ctx, {
        id: 'tu_1',
        name: 'set_title',
        input: { title: { en: 'Slider' } },
      });

      expect(outcome.isError).toBe(false);
      expect(outcome.content).toContain('Missing locales: nl-BE');
      expect(ctx.setTitle).toHaveBeenCalled();
    });

    it('rejects empty or non-string values', async () => {
      const ctx = buildContext();
      const outcome = await executeToolCall(ctx, {
        id: 'tu_1',
        name: 'set_title',
        input: { title: { en: '  ' } },
      });

      expect(outcome.isError).toBe(true);
      expect(ctx.setTitle).not.toHaveBeenCalled();
    });
  });

  it('rejects a manifest with the wrong shape', async () => {
    const ctx = buildContext();
    const outcome = await executeToolCall(ctx, {
      id: 'tu_2',
      name: 'set_manifest',
      input: { manifest: { manifest_version: 2, config_schema: 'nope' } },
    });

    expect(outcome.isError).toBe(true);
    expect(ctx.setFiles).not.toHaveBeenCalled();
  });

  it('reports unknown tools as errors', async () => {
    const outcome = await executeToolCall(buildContext(), {
      id: 'tu_3',
      name: 'explode' as never,
      input: {},
    });

    expect(outcome.isError).toBe(true);
  });
});
