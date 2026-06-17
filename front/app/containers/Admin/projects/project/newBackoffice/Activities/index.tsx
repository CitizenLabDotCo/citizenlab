import React, { useState } from 'react';

import {
  Box,
  Icon,
  Text,
  colors,
  fontSizes,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';
import SectionHeader from '../SectionHeader';

// NOTE: Activities are the back-office face of "floating" (non-timeline)
// participation methods from the parallel-participation initiative. That
// backend does not exist yet, so this panel is intentionally UI-only and
// rendered from the mock data below to match the prototype's sidebar layout.
// Wire it to real data once floating methods are persisted.
interface MockActivity {
  id: string;
  title: string;
  // Free-form descriptor shown under the title (e.g. "Ongoing" or a date range).
  meta: string;
  hidden?: boolean;
}

const MOCK_ACTIVITIES: MockActivity[] = [
  { id: 'mock-ask-us-anything', title: 'Ask us anything', meta: 'Ongoing' },
  {
    id: 'mock-in-person-surveys',
    title: 'In-person school surveys',
    meta: '10 – 28 Jun',
    hidden: true,
  },
];

const Dot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex: 0 0 auto;
  margin-top: 3px;
  background: ${colors.green500};
`;

const Row = styled.div`
  display: flex;
  gap: 10px;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 80ms ease-out;

  &:hover {
    background: ${colors.grey100};
  }
`;

const ActivityTitle = styled.span`
  font-size: ${fontSizes.s}px;
  color: ${colors.textPrimary};
`;

const NewActivityButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 8px;
  margin-top: 4px;
  border: 1px dashed ${colors.coolGrey300};
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  color: ${colors.coolGrey600};
  font-size: ${fontSizes.s}px;

  &:hover {
    border-color: ${colors.coolGrey500};
    color: ${colors.primary};
  }
`;

const Activities = () => {
  const { formatMessage } = useIntl();

  // Activities is collapsed by default (Timeline phases is the open-by-default
  // section). Once activities have real routes, open this when one is active.
  const [expanded, setExpanded] = useState(false);

  return (
    <Box p="12px" borderTop={`1px solid ${colors.grey200}`}>
      <SectionHeader
        title={formatMessage(messages.activities)}
        icon="list"
        expanded={expanded}
        onToggle={() => setExpanded((v) => !v)}
      />

      {expanded && (
        <>
          <Box display="flex" flexDirection="column">
            {MOCK_ACTIVITIES.map((activity) => (
              <Row key={activity.id} data-cy="e2e-new-project-activity-item">
                <Dot />
                <Box flexGrow={1} pb="4px">
                  <Box display="flex" alignItems="center" gap="6px">
                    <ActivityTitle>{activity.title}</ActivityTitle>
                    {activity.hidden && (
                      <Icon
                        name="eye-off"
                        width="14px"
                        height="14px"
                        fill={colors.coolGrey600}
                      />
                    )}
                  </Box>
                  <Text m="2px 0 0 0" fontSize="xs" color="textSecondary">
                    {activity.meta}
                    {activity.hidden
                      ? ` · ${formatMessage(messages.activityHidden)}`
                      : ''}
                  </Text>
                </Box>
              </Row>
            ))}
          </Box>

          <NewActivityButton
            type="button"
            data-cy="e2e-new-project-new-activity"
          >
            <Icon name="plus" width="16px" height="16px" fill="currentColor" />
            {formatMessage(messages.newActivity)}
          </NewActivityButton>
        </>
      )}
    </Box>
  );
};

export default Activities;
