import React, { useCallback, useMemo, useRef, useState } from 'react';

import {
  Box,
  Button,
  Input,
  Text,
  Title,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { BlockConfigValues } from 'api/custom_blocks/types';
import useAddCustomBlockVersion from 'api/custom_blocks/useAddCustomBlockVersion';
import useUpdateCustomBlock from 'api/custom_blocks/useUpdateCustomBlock';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useLocale from 'hooks/useLocale';

import { useIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';


import ManifestConfigForm from '../ManifestConfigForm';
import messages from '../messages';
import { defaultConfigValues } from '../utils';

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

const JsonView = styled.pre`
  margin: 0;
  padding: 12px;
  font-size: 12px;
  line-height: 1.5;
  overflow: auto;
  max-height: 260px;
  background: ${colors.grey100};
  border-radius: ${stylingConsts.borderRadius};
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

  const locale = useLocale();
  const [input, setInput] = useState('');
  const [tab, setTab] = useState<'preview' | 'code' | 'settings'>('preview');
  const [previewConfig, setPreviewConfig] = useState<BlockConfigValues>({});
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
    // Cap the collection: a misbehaving block must not grow state without
    // bound or re-render the panel on every async error.
    if (runtimeErrorsRef.current.length >= 50) return;
    runtimeErrorsRef.current.push(message);
    setRuntimeErrors([...runtimeErrorsRef.current]);
  }, []);

  const {
    chat,
    busy,
    failed,
    files,
    title,
    setTitleForLocale,
    blockId,
    sessionId,
    send,
    stop,
    pushEvent,
  } = useAuthoringLoop({
      tenantLocales: isNilOrError(tenantLocales) ? [] : [...tenantLocales],
      untitledTitle: formatMessage(messages.untitledBlock),
      truncatedEventText: formatMessage(messages.outputTruncated),
      truncatedStopText: formatMessage(messages.outputTruncatedStop),
      runtimeErrorsRef,
      onCompiled,
    });

  const schema = files.manifest.config_schema;
  // What the preview renders with: schema defaults overridden by edits made
  // in the Settings tab.
  const effectiveConfig = useMemo(
    () => ({ ...defaultConfigValues(schema), ...previewConfig }),
    [schema, previewConfig]
  );

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
      await updateBlock({ id: blockId, title_multiloc: title });
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
        <Box display="flex" alignItems="center" gap="20px" flex="1">
          <Title variant="h3" m="0">
            {formatMessage(messages.aiPanelTitle)}
          </Title>
          <Box w="280px">
            <Input
              type="text"
              value={title[locale] ?? ''}
              placeholder={formatMessage(messages.blockName)}
              onChange={(value) => setTitleForLocale(locale, value)}
              id="e2e-custom-block-name"
            />
          </Box>
        </Box>
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
            <Button
              buttonStyle={
                tab === 'settings' ? 'admin-dark' : 'secondary-outlined'
              }
              size="s"
              onClick={() => setTab('settings')}
              id="e2e-custom-block-settings-tab"
            >
              {formatMessage(messages.settingsTab)}
            </Button>
          </Box>
          <Box flex="1" overflowY="auto" background={colors.background}>
            {tab === 'preview' && (
              <PreviewSurface
                compiledCode={compiled}
                files={files}
                config={effectiveConfig}
                onRuntimeError={onRuntimeError}
              />
            )}
            {tab === 'code' && <CodeView>{files.source || '—'}</CodeView>}
            {tab === 'settings' && (
              <Box p="16px">
                <Title variant="h4" mt="0">
                  {formatMessage(messages.configurationHeading)}
                </Title>
                {schema.length === 0 ? (
                  <Text color="textSecondary">
                    {formatMessage(messages.noConfigFields)}
                  </Text>
                ) : (
                  <ManifestConfigForm
                    schema={schema}
                    values={effectiveConfig}
                    onChange={(fieldKey, value) => {
                      setPreviewConfig((current) => ({
                        ...current,
                        [fieldKey]: value,
                      }));
                    }}
                  />
                )}
                <Title variant="h4">
                  {formatMessage(messages.manifestHeading)}
                </Title>
                <JsonView>{JSON.stringify(files.manifest, null, 2)}</JsonView>
                <Title variant="h4">
                  {formatMessage(messages.messagesHeading)}
                </Title>
                <JsonView>{JSON.stringify(files.messages, null, 2)}</JsonView>
              </Box>
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
