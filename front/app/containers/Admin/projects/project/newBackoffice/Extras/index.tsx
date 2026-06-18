import React from 'react';

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

// NOTE: "Extras" are surveys that run outside the project timeline (the
// parallel-participation initiative's "floating" surveys). That backend does
// not exist yet, so this panel is intentionally UI-only and rendered from the
// mock data below to match the prototype's sidebar. Wire it to real data +
// routes once floating surveys are persisted.
type ExtraStatus = 'ongoing' | 'upcoming' | 'past';

interface MockExtra {
  id: string;
  title: string;
  // Date range, or null for a continuous survey (shown as "Ongoing").
  dateRange: string | null;
  // Drives the status dot colour. Green = ongoing/active.
  status: ExtraStatus;
  // Survey exists but is not surfaced on the public project page.
  notOnPage?: boolean;
}

const MOCK_EXTRAS: MockExtra[] = [
  {
    id: 'mock-ask-us-anything',
    title: 'Ask us anything',
    dateRange: null,
    status: 'ongoing',
  },
  {
    id: 'mock-school-survey',
    title: 'School survey',
    dateRange: '20 May – 5 Jun',
    status: 'ongoing',
    notOnPage: true,
  },
  {
    id: 'mock-market-day-poll',
    title: 'Market-day poll',
    dateRange: '15 – 17 Aug',
    status: 'upcoming',
    notOnPage: true,
  },
  {
    id: 'mock-popup-kiosk',
    title: 'Pop-up kiosk survey',
    dateRange: '2 – 4 May',
    status: 'past',
  },
];

const Dot = styled.div<{ status: ExtraStatus }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex: 0 0 auto;
  margin-top: 4px;
  ${({ status }) => {
    if (status === 'ongoing') return `background: ${colors.green500};`;
    if (status === 'past') return `background: ${colors.coolGrey500};`;
    return `background: ${colors.white}; border: 2px solid ${colors.coolGrey300};`;
  }}
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

const ExtraTitle = styled.span<{ past: boolean }>`
  font-size: ${fontSizes.s}px;
  font-weight: 600;
  color: ${({ past }) => (past ? colors.textSecondary : colors.textPrimary)};
  text-decoration: ${({ past }) => (past ? 'line-through' : 'none')};
`;

const NotOnPage = styled.span`
  text-decoration: underline dotted;
  text-underline-offset: 2px;
`;

const NewSurveyButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  margin-top: 4px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: ${colors.coolGrey700};
  font-size: ${fontSizes.s}px;

  &:hover {
    color: ${colors.primary};
  }
`;

const Extras = () => {
  const { formatMessage } = useIntl();

  return (
    <Box p="12px" borderTop={`1px solid ${colors.grey200}`}>
      <Text m="0" px="2px" fontSize="m" fontWeight="bold" color="textPrimary">
        {formatMessage(messages.extras)}
      </Text>
      <Text m="2px 0 8px 0" px="2px" fontSize="s" color="textSecondary">
        {formatMessage(messages.extrasSubtitle)}
      </Text>

      <Box display="flex" flexDirection="column">
        {MOCK_EXTRAS.map((extra) => (
          <Row key={extra.id} data-cy="e2e-new-project-extra-item">
            <Dot status={extra.status} />
            <Box flexGrow={1} pb="4px">
              <ExtraTitle past={extra.status === 'past'}>
                {extra.title}
              </ExtraTitle>
              <Text m="2px 0 0 0" fontSize="xs" color="textSecondary">
                {extra.dateRange ?? formatMessage(messages.extraOngoing)}
                {extra.notOnPage && (
                  <>
                    {' · '}
                    <NotOnPage>
                      {formatMessage(messages.extraNotOnPage)}
                    </NotOnPage>
                  </>
                )}
              </Text>
            </Box>
          </Row>
        ))}
      </Box>

      <NewSurveyButton type="button" data-cy="e2e-new-project-new-survey">
        <Icon name="plus" width="16px" height="16px" fill="currentColor" />
        {formatMessage(messages.newSurvey)}
      </NewSurveyButton>
    </Box>
  );
};

export default Extras;
