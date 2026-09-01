import { lintBlockSource } from './lint';
import { BlockDiagnostic, CompileResult } from './types';

export interface CheckedCompileResult extends CompileResult {
  lintErrors: BlockDiagnostic[];
}

let worker: Worker | null = null;
let nextId = 0;
const pending = new Map<number, (result: CompileResult) => void>();

const getWorker = () => {
  if (!worker) {
    worker = new Worker(new URL('./compile.worker.ts', import.meta.url), {
      type: 'module',
    });
    worker.onmessage = (
      event: MessageEvent<{ id: number; result: CompileResult }>
    ) => {
      const { id, result } = event.data;
      pending.get(id)?.(result);
      pending.delete(id);
    };
  }
  return worker;
};

export const compileBlockSource = (source: string): Promise<CompileResult> => {
  const id = nextId++;
  return new Promise((resolve) => {
    pending.set(id, resolve);
    getWorker().postMessage({ id, source });
  });
};

// Compile + static safety lint in one call. This is what the AI loop's
// set_source tool and the save path both use.
export const compileAndCheckBlockSource = async (
  source: string
): Promise<CheckedCompileResult> => {
  const [compiled, lintErrors] = await Promise.all([
    compileBlockSource(source),
    Promise.resolve(lintBlockSource(source)),
  ]);

  return { ...compiled, lintErrors };
};
