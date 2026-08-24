import React, { useCallback, useRef, useState } from 'react';

import {
  Box,
  Button,
  Text,
  Title,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useAddCustomBlockVersion from 'api/custom_blocks/useAddCustomBlockVersion';
import useUpdateCustomBlock from 'api/custom_blocks/useUpdateCustomBlock';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';

import { useIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import messages from '../messages';

import PreviewSurface from './PreviewSurface';
import useAuthoringLoop, { ChatItem } from './useAuthoringLoop';

const ChatInput = styled.textarea`
  width: 100%;
  min-height: 72px;
  padding: 8px;
  font-size: 14px;
  border: 1px solid ${colors.borderDark};
  border-radius: ${stylingConsts.borderRadius};
  resize: vertical;
`;

const CodeView = styled.pre`
  margin: 0;
  padding: 16px;
  font-size: 12px;
  line-height: 1.5;
  overflow: auto;
  height: 100%;
  background: ${colors.grey100};
`;

const ChatLine = ({ item }: { item: ChatItem }) => {
  if (item.role === 'event') {
    return (
      <Text m="0" mb="4px" fontSize="s" color="textSecondary">
        {item.text}
      </Text>
    );
  }

  return (
    <Box
      mb="8px"
      p="8px 12px"
      borderRadius={stylingConsts.borderRadius}
      background={item.role === 'user' ? colors.teal100 : colors.grey100}
    >
      <Text m="0" whiteSpace="pre-wrap">
        {item.text}
      </Text>
    </Box>
  );
};

interface Props {
  onClose: () => void;
}

const AiPanel = ({ onClose }: Props) => {
  const { formatMessage } = useIntl();
  const tenantLocales = useAppConfigurationLocales();

  const { mutateAsync: addVersion } = useAddCustomBlockVersion();
  const { mutateAsync: updateBlock } = useUpdateCustomBlock();

  const [input, setInput] = useState('');
  const [tab, setTab] = useState<'preview' | 'code'>('preview');
  const [compiled, setCompiled] = useState<string | null>(null);
  const [runtimeErrors, setRuntimeErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const runtimeErrorsRef = useRef<string[]>([]);

  const onCompiled = useCallback((code: string | null) => {
    runtimeErrorsRef.current = [];
    setRuntimeErrors([]);
    setCompiled(code);
  }, []);

  const onRuntimeError = useCallback((message: string) => {
    runtimeErrorsRef.current.push(message);
    setRuntimeErrors([...runtimeErrorsRef.current]);
  }, []);

  const { chat, busy, failed, files, blockId, sessionId, send, stop, pushEvent } =
    useAuthoringLoop({
      tenantLocales: isNilOrError(tenantLocales) ? [] : [...tenantLocales],
      untitledTitle: formatMessage(messages.untitledBlock),
      truncatedEventText: formatMessage(messages.outputTruncated),
      truncatedStopText: formatMessage(messages.outputTruncatedStop),
      runtimeErrorsRef,
      onCompiled,
    });

  if (isNilOrError(tenantLocales)) return null;

  const canSave = !!blockId && !!compiled && !busy && !saving;

  const saveDraft = async () => {
    if (!canSave || !compiled || !blockId) {
      pushEvent(formatMessage(messages.compileFailedSave));
      return;
    }
    setSaving(true);
    try {
      await addVersion({
        customBlockId: blockId,
        source: files.source,
        bundle: compiled,
        manifest: files.manifest,
        messages: files.messages,
        ai_session_id: sessionId ?? undefined,
      });
      pushEvent(formatMessage(messages.draftSaved));
      return true;
    } catch {
      pushEvent(formatMessage(messages.aiError));
      return false;
    } finally {
      setSaving(false);
    }
  };

  const publish = async () => {
    const saved = await saveDraft();
    if (!saved || !blockId) return;
    setSaving(true);
    try {
      await updateBlock({ id: blockId, status: 'published' });
      pushEvent(formatMessage(messages.published));
    } catch {
      pushEvent(formatMessage(messages.aiError));
    } finally {
      setSaving(false);
    }
  };

  const submit = () => {
    const text = input.trim();
    if (!text || busy) return;
    setInput('');
    send(text);
  };

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      right="0"
      bottom="0"
      zIndex="100000"
      background="#fff"
      display="flex"
      flexDirection="column"
      role="dialog"
      aria-label={formatMessage(messages.aiPanelTitle)}
      id="e2e-custom-block-ai-panel"
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        p="12px 20px"
        borderBottom={`1px solid ${colors.divider}`}
      >
        <Title variant="h3" m="0">
          {formatMessage(messages.aiPanelTitle)}
        </Title>
        <Box display="flex" gap="8px">
          <Button
            buttonStyle="secondary-outlined"
            size="s"
            disabled={!canSave}
            processing={saving}
            onClick={saveDraft}
            id="e2e-custom-block-save-draft"
          >
            {formatMessage(messages.saveDraft)}
          </Button>
          <Button
            buttonStyle="admin-dark"
            size="s"
            disabled={!canSave}
            onClick={publish}
            id="e2e-custom-block-publish"
          >
            {formatMessage(messages.publish)}
          </Button>
          <Button buttonStyle="text" size="s" onClick={onClose}>
            {formatMessage(messages.close)}
          </Button>
        </Box>
      </Box>

      <Box display="flex" flex="1" overflow="hidden">
        <Box
          w="400px"
          display="flex"
          flexDirection="column"
          borderRight={`1px solid ${colors.divider}`}
        >
          <Box flex="1" overflowY="auto" p="16px">
            {chat.map((item, index) => (
              <ChatLine key={index} item={item} />
            ))}
            {busy && (
              <Text fontSize="s" color="textSecondary">
                {formatMessage(messages.aiWorking)}
              </Text>
            )}
            {failed && (
              <Text fontSize="s" color="error">
                {formatMessage(messages.aiError)}
              </Text>
            )}
          </Box>
          <Box p="12px" borderTop={`1px solid ${colors.divider}`}>
            <ChatInput
              value={input}
              placeholder={formatMessage(messages.chatInputPlaceholder)}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  submit();
                }
              }}
              id="e2e-custom-block-chat-input"
            />
            <Box display="flex" justifyContent="flex-end" gap="8px" mt="8px">
              {busy && (
                <Button buttonStyle="text" size="s" onClick={stop}>
                  {formatMessage(messages.stop)}
                </Button>
              )}
              <Button
                buttonStyle="admin-dark"
                size="s"
                disabled={busy || input.trim() === ''}
                onClick={submit}
                id="e2e-custom-block-chat-send"
              >
                {formatMessage(messages.send)}
              </Button>
            </Box>
          </Box>
        </Box>

        <Box flex="1" display="flex" flexDirection="column" overflow="hidden">
          <Box display="flex" gap="4px" p="8px 16px">
            <Button
              buttonStyle={tab === 'preview' ? 'admin-dark' : 'secondary-outlined'}
              size="s"
              onClick={() => setTab('preview')}
            >
              {formatMessage(messages.previewTab)}
            </Button>
            <Button
              buttonStyle={tab === 'code' ? 'admin-dark' : 'secondary-outlined'}
              size="s"
              onClick={() => setTab('code')}
            >
              {formatMessage(messages.codeTab)}
            </Button>
          </Box>
          <Box flex="1" overflowY="auto" background={colors.background}>
            {tab === 'preview' ? (
              <PreviewSurface
                compiledCode={compiled}
                files={files}
                onRuntimeError={onRuntimeError}
              />
            ) : (
              <CodeView>{files.source || '—'}</CodeView>
            )}
          </Box>
          {runtimeErrors.length > 0 && (
            <Box
              p="8px 16px"
              background={colors.errorLight}
              maxHeight="120px"
              overflowY="auto"
            >
              {runtimeErrors.slice(-3).map((error, index) => (
                <Text key={index} m="0" fontSize="s" color="error">
                  {error}
                </Text>
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default AiPanel;
