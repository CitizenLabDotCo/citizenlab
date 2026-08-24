import { IAiToolCall } from 'api/custom_block_ai_sessions/types';
import { BlockManifest, BlockMessages } from 'api/custom_blocks/types';

import fetcher from 'utils/cl-react-query/fetcher';

import { compileAndCheckBlockSource } from '../compiler';
import { SDK_DATA_HOOKS } from '../runtime/sdkContract';

export interface DraftFiles {
  source: string;
  manifest: BlockManifest;
  messages: BlockMessages;
}

export interface ToolExecutorContext {
  setFiles: (update: Partial<DraftFiles>) => void;
  setTitle: (title: Record<string, string>) => void;
  // Called with freshly compiled code; the preview surface picks it up.
  setCompiled: (code: string | null) => void;
  // Runtime errors collected by the preview surface since the last compile.
  runtimeErrorsRef: { current: string[] };
  tenantLocales: string[];
}

export interface ToolOutcome {
  content: string;
  isError: boolean;
}

const CONFIG_FIELD_TYPES = [
  'text',
  'number',
  'boolean',
  'multiloc_text',
  'select',
];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const asJson = (value: unknown) => JSON.stringify(value, null, 1);

const executeSetSource = async (
  ctx: ToolExecutorContext,
  input: Record<string, unknown>
): Promise<ToolOutcome> => {
  const source = input.source;
  if (typeof source !== 'string' || source.trim() === '') {
    return {
      content: 'set_source requires a non-empty "source" string.',
      isError: true,
    };
  }

  const result = await compileAndCheckBlockSource(source);
  ctx.setFiles({ source });

  if (!result.ok || result.lintErrors.length > 0) {
    ctx.setCompiled(null);
    return {
      isError: true,
      content: asJson({
        ok: false,
        compile_errors: result.errors,
        lint_errors: result.lintErrors,
      }),
    };
  }

  // Mount the preview and give render errors a moment to surface.
  ctx.runtimeErrorsRef.current = [];
  ctx.setCompiled(result.code);
  await sleep(900);
  const runtimeErrors = [...ctx.runtimeErrorsRef.current];

  return {
    isError: runtimeErrors.length > 0,
    content: asJson({
      ok: runtimeErrors.length === 0,
      compile_errors: [],
      lint_errors: [],
      runtime_errors: runtimeErrors,
    }),
  };
};

// The manifest arrives from the model at runtime, so every shape assumption
// must be checked, whatever the declared types promise.
type UnknownRecord = Record<string, unknown>;

const executeSetTitle = (
  ctx: ToolExecutorContext,
  input: Record<string, unknown>
): ToolOutcome => {
  const title = (input.title ?? input) as unknown;

  const valid =
    typeof title === 'object' &&
    title !== null &&
    !Array.isArray(title) &&
    Object.values(title).every(
      (value) => typeof value === 'string' && value.trim() !== ''
    ) &&
    Object.keys(title).length > 0;

  if (!valid) {
    return {
      isError: true,
      content:
        'set_title requires { title: { "<locale>": "<name>" } } with a non-empty name per locale.',
    };
  }

  const catalog = title as Record<string, string>;
  const missing = ctx.tenantLocales.filter((locale) => !(locale in catalog));
  ctx.setTitle(catalog);
  return {
    isError: false,
    content: asJson({
      ok: true,
      ...(missing.length > 0
        ? { warning: `Missing locales: ${missing.join(', ')}.` }
        : {}),
    }),
  };
};

const validateManifest = (manifest: UnknownRecord): string[] => {
  const errors: string[] = [];

  if (manifest.manifest_version !== 1) {
    errors.push('manifest_version must be 1.');
  }
  if (manifest.sdk_version !== 1) {
    errors.push('sdk_version must be 1.');
  }
  if (
    !Array.isArray(manifest.targets) ||
    (manifest.targets as unknown[]).some((target) => target !== 'homepage')
  ) {
    errors.push("targets must be ['homepage'].");
  }
  if (!Array.isArray(manifest.data_uses)) {
    errors.push('data_uses must be an array of gv-sdk hook names.');
  } else {
    manifest.data_uses.forEach((hook) => {
      if (!(SDK_DATA_HOOKS as readonly string[]).includes(hook)) {
        errors.push(`data_uses contains unknown hook '${hook}'.`);
      }
    });
  }
  if (!Array.isArray(manifest.config_schema)) {
    errors.push('config_schema must be an array (can be empty).');
  } else {
    (manifest.config_schema as unknown[]).forEach((rawField, index) => {
      const field = (rawField ?? {}) as UnknownRecord;
      if (typeof field.key !== 'string') {
        errors.push(`config_schema[${index}] needs a string "key".`);
      }
      if (!CONFIG_FIELD_TYPES.includes(String(field.type))) {
        errors.push(
          `config_schema[${index}].type must be one of ${CONFIG_FIELD_TYPES.join(
            ', '
          )}.`
        );
      }
      if (typeof field.label !== 'object' || field.label === null) {
        errors.push(`config_schema[${index}].label must be a multiloc object.`);
      }
      if (field.type === 'select' && !Array.isArray(field.options)) {
        errors.push(`config_schema[${index}].options must be an array.`);
      }
    });
  }

  return errors;
};

const executeSetManifest = (
  ctx: ToolExecutorContext,
  input: Record<string, unknown>
): ToolOutcome => {
  const manifest = (input.manifest ?? input) as UnknownRecord;
  const errors = validateManifest(manifest);

  if (errors.length > 0) {
    return { content: asJson({ ok: false, errors }), isError: true };
  }

  ctx.setFiles({ manifest: manifest as unknown as BlockManifest });
  return { content: asJson({ ok: true }), isError: false };
};

const executeSetMessages = (
  ctx: ToolExecutorContext,
  input: Record<string, unknown>
): ToolOutcome => {
  const messages = (input.messages ?? input) as unknown;
  const errors: string[] = [];

  if (
    typeof messages !== 'object' ||
    messages === null ||
    Array.isArray(messages)
  ) {
    errors.push('messages must be an object: { locale: { message_id: text } }.');
  } else {
    Object.entries(messages).forEach(([locale, catalog]) => {
      if (typeof catalog !== 'object' || catalog === null) {
        errors.push(`messages['${locale}'] must be an object of strings.`);
      }
    });
  }

  if (errors.length > 0) {
    return { content: asJson({ ok: false, errors }), isError: true };
  }

  const catalogs = messages as BlockMessages;
  const missing = ctx.tenantLocales.filter((locale) => !(locale in catalogs));
  ctx.setFiles({ messages: catalogs });
  return {
    isError: false,
    content: asJson({
      ok: true,
      ...(missing.length > 0
        ? { warning: `Missing locales: ${missing.join(', ')}.` }
        : {}),
    }),
  };
};

const DATA_SAMPLES: Record<string, () => Promise<unknown>> = {
  useProjectsMini: () =>
    fetcher({
      path: '/projects/with_active_participatory_phase',
      action: 'get',
      queryParams: { 'page[size]': 2 },
    }),
  useAuthUser: () => fetcher({ path: '/users/me', action: 'get' }),
  useAppConfiguration: () =>
    fetcher({ path: '/app_configuration', action: 'get' }),
};

const executeGetDataSample = async (
  input: Record<string, unknown>
): Promise<ToolOutcome> => {
  const hook = String(input.hook ?? '');
  const sample = (
    DATA_SAMPLES as Record<string, (() => Promise<unknown>) | undefined>
  )[hook];

  if (!sample) {
    return {
      isError: true,
      content: `Unknown hook '${hook}'. Available: ${Object.keys(
        DATA_SAMPLES
      ).join(', ')}.`,
    };
  }

  try {
    const data = await sample();
    return { content: JSON.stringify(data).slice(0, 5000), isError: false };
  } catch (error) {
    return { content: `Sample request failed: ${String(error)}`, isError: true };
  }
};

export const executeToolCall = async (
  ctx: ToolExecutorContext,
  call: IAiToolCall
): Promise<ToolOutcome> => {
  switch (call.name) {
    case 'set_title':
      return executeSetTitle(ctx, call.input);
    case 'set_source':
      return executeSetSource(ctx, call.input);
    case 'set_manifest':
      return executeSetManifest(ctx, call.input);
    case 'set_messages':
      return executeSetMessages(ctx, call.input);
    case 'get_data_sample':
      return executeGetDataSample(call.input);
    default:
      return { content: `Unknown tool '${call.name}'.`, isError: true };
  }
};
