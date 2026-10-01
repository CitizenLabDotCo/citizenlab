import React, { useEffect, useRef, useState } from 'react';

import { Box, Title, stylingConsts } from '@citizenlab/cl2-component-library';
import { useEditor, SerializedNodes } from '@craftjs/core';
import styled from 'styled-components';

import useReportChat from 'api/report_chat/useReportChat';
import useSendReportChatMessage from 'api/report_chat/useSendReportChatMessage';
import useReportLayout from 'api/report_layout/useReportLayout';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { SETTINGS_PANEL_WIDTH } from 'components/admin/ContentBuilder/constants';
import ButtonWithLink from 'components/UI/ButtonWithLink';
import TextArea from 'components/UI/TextArea';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from './messages';
import Transcript from './Transcript';

const Panel = styled(Box)`
  box-shadow: -2px 0px 1px 0px rgba(0, 0, 0, 0.06);
`;

interface Props {
  reportId: string;
  setSaved: (savedNodes: SerializedNodes) => void;
}

// The report chat. It sits where the widget settings sit, and shows whenever no
// widget is selected, so the panel is either "this block" or "the whole report".
const ChatPanel = ({ reportId, setSaved }: Props) => {
  const llmReportingEnabled = useFeatureFlag({ name: 'llm_reporting' });
  const { formatMessage } = useIntl();
  const { actions, query } = useEditor();
  const [draft, setDraft] = useState('');

  const { data: chat } = useReportChat(reportId, {
    enabled: llmReportingEnabled,
  });
  const { mutate: sendMessage, isPending: sending } =
    useSendReportChatMessage();
  const { refetch: refetchLayout } = useReportLayout(reportId);

  const pending = chat?.data.attributes.pending ?? false;
  const turns = chat?.data.attributes.turns ?? [];
  const lastTurn = turns.at(-1);

  // A turn that changed the report wrote a new layout server-side, so the editor
  // has to be told. Only a turn this panel watched finish counts, and only one that
  // actually changed something: pulling the stored layout after a turn that just
  // answered a question would throw away edits the admin has not saved.
  const watchedTurnRef = useRef(false);

  useEffect(() => {
    if (pending) {
      watchedTurnRef.current = true;
      return;
    }
    if (!watchedTurnRef.current) return;
    watchedTurnRef.current = false;
    if (!lastTurn?.changed_layout) return;

    refetchLayout().then(({ data }) => {
      const craftjsJson = data?.data.attributes.craftjs_json;
      if (!craftjsJson) return;

      actions.deserialize(craftjsJson);
      setSaved(craftjsJson);
    });
  }, [pending, lastTurn, refetchLayout, actions, setSaved]);

  if (!llmReportingEnabled) return null;

  const submit = () => {
    const message = draft.trim();
    if (!message || pending || sending) return;

    // Send the layout as it stands in the editor, so unsaved edits are what the
    // model revises rather than what it overwrites.
    sendMessage({ reportId, message, craftjsJson: query.getSerializedNodes() });
    setDraft('');
  };

  return (
    <Panel
      position="fixed"
      right="0"
      top={`${stylingConsts.menuHeight}px`}
      zIndex="99999"
      p="20px"
      w={SETTINGS_PANEL_WIDTH}
      h={`calc(100vh - ${stylingConsts.menuHeight}px)`}
      background="#ffffff"
      display="flex"
      flexDirection="column"
      id="e2e-report-chat-panel"
    >
      <Title variant="h2" mt="-4px" mb="16px">
        <FormattedMessage {...messages.title} />
      </Title>

      <Box flex="1" overflowY="auto" mb="12px">
        <Transcript turns={turns} pending={pending} />
      </Box>

      <Box
        onKeyDown={(event: React.KeyboardEvent) => {
          // Cmd/Ctrl+Enter sends; plain Enter keeps writing a longer instruction.
          if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
            submit();
          }
        }}
      >
        <TextArea
          value={draft}
          rows={3}
          disabled={pending}
          placeholder={formatMessage(messages.placeholder)}
          onChange={setDraft}
        />
      </Box>
      <Box mt="8px">
        <ButtonWithLink
          buttonStyle="primary"
          icon="stars"
          size="s"
          disabled={pending || draft.trim().length === 0}
          processing={sending}
          onClick={submit}
        >
          <FormattedMessage {...messages.send} />
        </ButtonWithLink>
      </Box>
    </Panel>
  );
};

export default ChatPanel;
