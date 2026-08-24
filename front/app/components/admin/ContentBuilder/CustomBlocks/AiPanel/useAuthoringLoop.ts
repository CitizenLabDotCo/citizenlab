import { useCallback, useRef, useState } from 'react';

import {
  IAiToolCall,
  IAiToolResult,
} from 'api/custom_block_ai_sessions/types';
import useAddAiTurn from 'api/custom_block_ai_sessions/useAddAiTurn';
import useAddCustomBlockAiSession from 'api/custom_block_ai_sessions/useAddCustomBlockAiSession';
import { BlockManifest, BlockMessages } from 'api/custom_blocks/types';
import useAddCustomBlock from 'api/custom_blocks/useAddCustomBlock';

import { DraftFiles, executeToolCall } from './toolExecutor';
import { planToolRound } from './turnHandling';

// Hard stop for one user turn: at most this many model round trips.
const MAX_TOOL_ROUNDS = 12;

export interface ChatItem {
  role: 'user' | 'assistant' | 'event';
  text: string;
}

const EMPTY_MANIFEST: BlockManifest = {
  manifest_version: 1,
  sdk_version: 1,
  targets: ['homepage'],
  data_uses: [],
  config_schema: [],
};

interface Options {
  tenantLocales: string[];
  untitledTitle: string;
  // Pre-formatted UI strings for loop events (the hook stays intl-free).
  truncatedEventText: string;
  truncatedStopText: string;
  // Runtime errors reported by the preview surface (shared mutable ref).
  runtimeErrorsRef: { current: string[] };
  onCompiled: (code: string | null) => void;
}

// The client half of the authoring loop. The server owns the transcript and
// the model call; this hook sends user messages, executes tool calls locally
// (compile, lint, preview, data samples) and posts the results back until the
// model stops asking for tools.
const useAuthoringLoop = ({
  tenantLocales,
  untitledTitle,
  truncatedEventText,
  truncatedStopText,
  runtimeErrorsRef,
  onCompiled,
}: Options) => {
  const { mutateAsync: addCustomBlock } = useAddCustomBlock();
  const { mutateAsync: addAiSession } = useAddCustomBlockAiSession();
  const { mutateAsync: addAiTurn } = useAddAiTurn();

  const [chat, setChat] = useState<ChatItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [blockId, setBlockId] = useState<string | null>(null);
  const [files, setFilesState] = useState<DraftFiles>({
    source: '',
    manifest: EMPTY_MANIFEST,
    messages: {} as BlockMessages,
  });

  const sessionIdRef = useRef<string | null>(null);
  const filesRef = useRef(files);
  const cancelledRef = useRef(false);

  const setFiles = useCallback((update: Partial<DraftFiles>) => {
    filesRef.current = { ...filesRef.current, ...update };
    setFilesState(filesRef.current);
  }, []);

  const pushChat = useCallback((item: ChatItem) => {
    setChat((current) => [...current, item]);
  }, []);

  const pushEvent = useCallback(
    (text: string) => pushChat({ role: 'event', text }),
    [pushChat]
  );

  const ensureSession = useCallback(async () => {
    let id = blockId;
    if (!id) {
      const block = await addCustomBlock({
        title_multiloc: Object.fromEntries(
          tenantLocales.map((locale) => [locale, untitledTitle])
        ),
      });
      id = block.data.id;
      setBlockId(id);
    }

    if (!sessionIdRef.current) {
      const session = await addAiSession({ customBlockId: id });
      sessionIdRef.current = session.data.id;
    }

    return sessionIdRef.current;
  }, [addAiSession, addCustomBlock, blockId, tenantLocales, untitledTitle]);

  const runToolCalls = useCallback(
    async (toolCalls: IAiToolCall[]) => {
      const results: IAiToolResult[] = [];
      for (const call of toolCalls) {
        pushEvent(`→ ${call.name}`);
        const outcome = await executeToolCall(
          {
            setFiles,
            setCompiled: onCompiled,
            runtimeErrorsRef,
            tenantLocales,
          },
          call
        );
        results.push({
          tool_use_id: call.id,
          content: outcome.content,
          is_error: outcome.isError,
        });
      }
      return results;
    },
    [onCompiled, pushEvent, runtimeErrorsRef, setFiles, tenantLocales]
  );

  // Read through a function: stop() flips the ref from another closure, which
  // assignment-based narrowing inside send() cannot see.
  const isCancelled = useCallback(() => cancelledRef.current, []);

  const send = useCallback(
    async (userText: string) => {
      if (busy || userText.trim() === '') return;

      cancelledRef.current = false;
      setBusy(true);
      setFailed(false);
      pushChat({ role: 'user', text: userText });

      try {
        const sessionId = await ensureSession();

        let turn = await addAiTurn({ sessionId, user_message: userText });
        let truncationStreak = 0;

        for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
          const { assistant_text, tool_calls } = turn.data.attributes;

          if (assistant_text) {
            pushChat({ role: 'assistant', text: assistant_text });
          }
          if (tool_calls.length === 0 || isCancelled()) break;

          const plan = planToolRound(turn.data.attributes);
          let toolResults;
          if (plan.execute) {
            truncationStreak = 0;
            toolResults = await runToolCalls(tool_calls);
          } else {
            // The reply was cut off by the output limit: the tool inputs are
            // incomplete, so answer them with a retry instruction instead of
            // executing. Two truncations in a row means the request does not
            // fit; hand control back to the admin.
            truncationStreak += 1;
            pushEvent(truncatedEventText);
            if (truncationStreak >= 2) {
              pushEvent(truncatedStopText);
              break;
            }
            toolResults = plan.autoResults;
          }
          if (isCancelled()) break;

          turn = await addAiTurn({ sessionId, tool_results: toolResults });
        }
      } catch {
        setFailed(true);
      } finally {
        setBusy(false);
      }
    },
    [
      addAiTurn,
      busy,
      ensureSession,
      isCancelled,
      pushChat,
      pushEvent,
      runToolCalls,
      truncatedEventText,
      truncatedStopText,
    ]
  );

  const stop = useCallback(() => {
    cancelledRef.current = true;
  }, []);

  return {
    chat,
    busy,
    failed,
    files,
    blockId,
    sessionId: sessionIdRef.current,
    send,
    stop,
    pushEvent,
  };
};

export default useAuthoringLoop;
