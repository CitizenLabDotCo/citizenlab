import React, {
  FocusEvent,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { Box, Icon, Text, bo, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

import { ToastContent, ToastContext } from './useToast';

export const SHOWN_FOR_MS = 6000;

const UndoButton = styled.button`
  padding: 4px 8px;
  border: none;
  border-radius: ${bo.borderRadius};
  background: transparent;
  color: inherit;
  font: inherit;
  text-decoration: underline;
  cursor: pointer;

  &:hover {
    text-decoration: none;
  }
`;

interface Props {
  children: ReactNode;
}

// Changes apply at once, without asking first: the toast says it's done and
// offers to take it back for a few seconds. It stays while the pointer or the
// focus is on it, so Undo can't go away under someone reaching for it.
const ToastProvider = ({ children }: Props) => {
  const { formatMessage } = useIntl();
  const [content, setContent] = useState<ToastContent | null>(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  // Where the focus was when the change was made, to go back to after Undo
  // takes the button away.
  const returnFocusTo = useRef<Element | null>(null);

  const show = useCallback((next: ToastContent) => {
    returnFocusTo.current = document.activeElement;
    setContent(next);
  }, []);

  const paused = hovered || focused;

  useEffect(() => {
    if (!content || paused) return;
    const timeout = setTimeout(() => setContent(null), SHOWN_FOR_MS);
    return () => clearTimeout(timeout);
  }, [content, paused]);

  const hide = () => {
    setContent(null);
    setHovered(false);
    setFocused(false);
  };

  const handleBlur = (event: FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
  };

  const undo = content?.undo;

  return (
    <ToastContext.Provider value={show}>
      {children}
      {/* Always there, so screen readers hear each new message. */}
      <Box
        role="status"
        position="fixed"
        bottom="48px"
        left="50%"
        transform="translateX(-50%)"
        zIndex="1000"
      >
        {content && (
          <Box
            display="flex"
            alignItems="center"
            gap="8px"
            minHeight="40px"
            pl="12px"
            pr={undo ? '4px' : '12px'}
            borderRadius={bo.panelBorderRadius}
            bgColor={content.error ? colors.errorLight : colors.successLight}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onFocus={() => setFocused(true)}
            onBlur={handleBlur}
          >
            <Icon
              name={content.error ? 'alert-circle' : 'check-circle'}
              width="16px"
              height="16px"
              fill={content.error ? colors.red600 : colors.green700}
            />
            <Text m="0" variant="boControl">
              {content.message}
            </Text>
            {undo && (
              <UndoButton
                type="button"
                onClick={() => {
                  const target = returnFocusTo.current;
                  hide();
                  if (target instanceof HTMLElement && target.isConnected) {
                    target.focus();
                  }
                  undo();
                }}
              >
                <Text as="span" m="0" variant="boControl">
                  {formatMessage(messages.undo)}
                </Text>
              </UndoButton>
            )}
          </Box>
        )}
      </Box>
    </ToastContext.Provider>
  );
};

export default ToastProvider;
