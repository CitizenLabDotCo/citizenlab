import React, { ComponentType, useEffect, useState } from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import useLocale from 'hooks/useLocale';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';
import CustomBlockRenderer, {
  buildMessageLookup,
} from '../runtime/CustomBlockRenderer';
import { loadBlockModuleFromCode } from '../runtime/loadBlockModule';
import { BlockProps } from '../runtime/types';

import { DraftFiles } from './toolExecutor';

interface Props {
  compiledCode: string | null;
  files: DraftFiles;
  // Effective config values (schema defaults + panel edits).
  config: BlockProps['config'];
  onRuntimeError: (message: string) => void;
}

const trimStack = (stack: string | null) =>
  stack ? `\n${stack.split('\n').slice(0, 3).join('\n')}` : '';

// Renders the draft block from freshly compiled code and reports every way it
// can blow up (import failure, render error, async error) so the loop can feed
// it back to the model.
const PreviewSurface = ({
  compiledCode,
  files,
  config,
  onRuntimeError,
}: Props) => {
  const locale = useLocale();
  const [BlockComponent, setBlockComponent] =
    useState<ComponentType<BlockProps> | null>(null);

  useEffect(() => {
    if (!compiledCode) {
      setBlockComponent(null);
      return;
    }

    let live = true;
    loadBlockModuleFromCode(compiledCode)
      .then((mod) => {
        if (live) setBlockComponent(() => mod.default);
      })
      .catch((error) => {
        if (live) {
          setBlockComponent(null);
          onRuntimeError(`Module failed to load: ${String(error)}`);
        }
      });

    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compiledCode]);

  useEffect(() => {
    if (!compiledCode) return;

    const onError = (event: ErrorEvent) => {
      onRuntimeError(String(event.message));
    };
    const onRejection = (event: PromiseRejectionEvent) => {
      onRuntimeError(`Unhandled rejection: ${String(event.reason)}`);
    };

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compiledCode]);

  if (!compiledCode || !BlockComponent) {
    return (
      <Box p="24px">
        <Text color="textSecondary">
          <FormattedMessage {...messages.previewEmpty} />
        </Text>
      </Box>
    );
  }

  return (
    <Box p="16px" background="#fff">
      <CustomBlockRenderer
        component={BlockComponent}
        config={config}
        msg={buildMessageLookup(files.messages, locale)}
        onError={(error, componentStack) => {
          onRuntimeError(
            `Render error: ${error.message}${trimStack(componentStack)}`
          );
        }}
        fallback={
          <Text color="error">
            <FormattedMessage {...messages.blockLoadError} />
          </Text>
        }
      />
    </Box>
  );
};

export default PreviewSurface;
